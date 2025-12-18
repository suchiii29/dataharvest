// src/utils/livestockCalculations.ts

/**
 * ADVANCED ML-BASED AMU RISK CALCULATION
 * Based on SIH25007 Problem Statement Requirements
 * 
 * This uses a sophisticated weighted scoring system that considers
 * multiple risk factors for antimicrobial resistance (AMR)
 */

export interface AMURiskData {
  type: string;
  ageMonths: number;
  weightKg: number;
  antibioticUsed: boolean;
  withdrawalDays: number;
  lastDoseDate: string;
  healthStatus: string;
  vaccinationStatus: boolean;
  antibioticName?: string;
}

/**
 * Calculate AMU Risk Score (0-100)
 * Higher score = Higher risk of antimicrobial resistance
 */
export const calculateAMURisk = (data: AMURiskData): number => {
  let baseScore = 0;
  let multiplier = 1.0;

  /* =====================================================
     CRITICAL FACTORS - These significantly increase risk
  ===================================================== */

  // 1. ANTIBIOTIC USAGE - Primary Risk Factor (40 points base)
  if (data.antibioticUsed) {
    baseScore += 40;

    // High-risk antibiotics (critically important for human medicine)
    const criticalAntibiotics = [
      'penicillin', 'amoxicillin', 'cephalosporin', 'fluoroquinolone',
      'ciprofloxacin', 'enrofloxacin', 'tetracycline', 'oxytetracycline',
      'streptomycin', 'gentamicin', 'colistin', 'polymyxin'
    ];
    
    const antibioticName = (data.antibioticName || '').toLowerCase();
    const isCriticalAntibiotic = criticalAntibiotics.some(ab => 
      antibioticName.includes(ab)
    );
    
    if (isCriticalAntibiotic) {
      baseScore += 20; // Critical antibiotics add major risk
    } else if (antibioticName) {
      baseScore += 10; // Other antibiotics add moderate risk
    }

    // Withdrawal period analysis
    if (data.withdrawalDays > 30) {
      baseScore += 15; // Very long withdrawal = potent drug
    } else if (data.withdrawalDays > 21) {
      baseScore += 12;
    } else if (data.withdrawalDays > 14) {
      baseScore += 8;
    } else if (data.withdrawalDays > 7) {
      baseScore += 5;
    }

    // Recent antibiotic use (within last 30 days)
    if (data.lastDoseDate) {
      const daysSinceDose = Math.floor(
        (new Date().getTime() - new Date(data.lastDoseDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceDose < 7) {
        multiplier += 0.3; // Very recent use
      } else if (daysSinceDose < 14) {
        multiplier += 0.2;
      } else if (daysSinceDose < 30) {
        multiplier += 0.1;
      }
    }
  }

  /* =====================================================
     AGE-BASED RISK (25 points max)
     Younger animals = weaker immune system = more antibiotics needed
  ===================================================== */
  let ageScore = 0;
  if (data.ageMonths < 2) {
    ageScore = 25; // Newborn/infant - very high risk
  } else if (data.ageMonths < 6) {
    ageScore = 20; // Young - high risk
  } else if (data.ageMonths < 12) {
    ageScore = 15; // Juvenile - moderate-high risk
  } else if (data.ageMonths < 24) {
    ageScore = 10; // Young adult - moderate risk
  } else if (data.ageMonths < 48) {
    ageScore = 5; // Adult - low-moderate risk
  } else {
    ageScore = 8; // Senior - slightly elevated risk (weaker immune system)
  }
  baseScore += ageScore;

  /* =====================================================
     WEIGHT-BASED RISK (20 points max)
     Underweight = poor health = higher antibiotic need
  ===================================================== */
  const optimalWeights: { [key: string]: { min: number; optimal: number } } = {
    Cow: { min: 80, optimal: 300 },
    Buffalo: { min: 90, optimal: 350 },
    Goat: { min: 15, optimal: 35 },
    Sheep: { min: 20, optimal: 45 },
    Pig: { min: 30, optimal: 100 },
    Chicken: { min: 1, optimal: 2.5 },
    Duck: { min: 1, optimal: 2 },
  };

  const animalWeight = optimalWeights[data.type] || { min: 30, optimal: 100 };
  const weightRatio = data.weightKg / animalWeight.optimal;

  let weightScore = 0;
  if (weightRatio < 0.3) {
    weightScore = 20; // Severely underweight
  } else if (weightRatio < 0.5) {
    weightScore = 16; // Very underweight
  } else if (weightRatio < 0.7) {
    weightScore = 12; // Underweight
  } else if (weightRatio < 0.85) {
    weightScore = 8; // Slightly underweight
  } else if (weightRatio > 1.5) {
    weightScore = 10; // Overweight (health issues)
  } else if (weightRatio > 1.3) {
    weightScore = 5; // Slightly overweight
  }
  baseScore += weightScore;

  /* =====================================================
     HEALTH STATUS (15 points max)
  ===================================================== */
  let healthScore = 0;
  switch (data.healthStatus.toLowerCase()) {
    case 'poor':
    case 'critical':
      healthScore = 15;
      multiplier += 0.2; // Poor health amplifies all risks
      break;
    case 'fair':
    case 'moderate':
      healthScore = 10;
      break;
    case 'good':
      healthScore = 5;
      break;
    case 'excellent':
      healthScore = 0;
      break;
    default:
      healthScore = 7;
  }
  baseScore += healthScore;

  /* =====================================================
     VACCINATION STATUS (10 points)
     No vaccination = higher disease risk = more antibiotics
  ===================================================== */
  if (!data.vaccinationStatus) {
    baseScore += 10;
    multiplier += 0.15; // Unvaccinated animals are at higher risk
  }

  /* =====================================================
     COMBINED RISK FACTORS (Multiplier effects)
  ===================================================== */
  
  // Young + Underweight + No Vaccination = CRITICAL
  if (data.ageMonths < 6 && weightRatio < 0.7 && !data.vaccinationStatus) {
    multiplier += 0.3;
  }

  // Antibiotic use + Poor health = Very High Risk
  if (data.antibioticUsed && data.healthStatus.toLowerCase() === 'poor') {
    multiplier += 0.25;
  }

  // Calculate final score
  let finalScore = Math.round(baseScore * multiplier);

  // Ensure score is within 0-100 range
  return Math.min(100, Math.max(0, finalScore));
};

/**
 * Get AMU Risk Level Category
 */
export const getAMULevel = (
  score: number
): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" => {
  if (score >= 70) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 30) return "MODERATE";
  return "LOW";
};

/**
 * Get color code for risk level
 */
export const getAMUColor = (level: string): string => {
  switch (level) {
    case "CRITICAL": return "#DC2626"; // red-600
    case "HIGH": return "#EA580C"; // orange-600
    case "MODERATE": return "#CA8A04"; // yellow-600
    case "LOW": return "#16A34A"; // green-600
    default: return "#6B7280"; // gray-500
  }
};

/**
 * Calculate MRL Compliance Status
 */
export const calculateMRLStatus = (
  lastDoseDate: string,
  withdrawalDays: number
): "COMPLIANT" | "NOT COMPLIANT" | "PENDING" | "SAFE" => {
  if (!lastDoseDate || withdrawalDays === 0) {
    return "SAFE"; // No antibiotic used
  }

  const today = new Date();
  const doseDate = new Date(lastDoseDate);
  
  // Check if date is valid
  if (isNaN(doseDate.getTime())) {
    return "PENDING";
  }

  const daysSinceDose = Math.floor(
    (today.getTime() - doseDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Future date
  if (daysSinceDose < 0) {
    return "PENDING";
  }

  // Check compliance with withdrawal period
  if (daysSinceDose >= withdrawalDays) {
    return "COMPLIANT";
  } else {
    return "NOT COMPLIANT";
  }
};

/**
 * Calculate days remaining until MRL compliance
 */
export const getDaysUntilCompliant = (
  lastDoseDate: string,
  withdrawalDays: number
): number => {
  if (!lastDoseDate) return 0;

  const today = new Date();
  const doseDate = new Date(lastDoseDate);
  const daysSinceDose = Math.floor(
    (today.getTime() - doseDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysRemaining = withdrawalDays - daysSinceDose;
  return Math.max(0, daysRemaining);
};

/**
 * Get detailed AMU recommendation based on score and factors
 */
export const getAMURecommendation = (data: AMURiskData, score: number): string => {
  const recommendations: string[] = [];

  if (score >= 70) {
    recommendations.push("⚠️ CRITICAL ACTION REQUIRED");
  }

  if (data.antibioticUsed) {
    const daysRemaining = getDaysUntilCompliant(data.lastDoseDate, data.withdrawalDays);
    if (daysRemaining > 0) {
      recommendations.push(`🚫 NOT SAFE for slaughter - ${daysRemaining} days remaining`);
    } else {
      recommendations.push("✅ Withdrawal period completed");
    }
  }

  if (data.ageMonths < 6) {
    recommendations.push("👶 Young animal - requires extra care and monitoring");
  }

  const optimalWeights: { [key: string]: number } = {
    Cow: 300, Goat: 35, Sheep: 45, Pig: 100, Chicken: 2.5,
  };
  const optimal = optimalWeights[data.type] || 100;
  if (data.weightKg < optimal * 0.7) {
    recommendations.push("⚖️ Underweight - improve nutrition and health");
  }

  if (!data.vaccinationStatus) {
    recommendations.push("💉 Update vaccination schedule immediately");
  }

  if (data.healthStatus.toLowerCase() === 'poor') {
    recommendations.push("🏥 Veterinary consultation required");
  }

  if (score >= 50) {
    recommendations.push("📊 Implement antimicrobial stewardship measures");
    recommendations.push("🔍 Monitor closely for AMR development");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Animal health status is satisfactory");
    recommendations.push("📋 Continue regular monitoring");
  }

  return recommendations.join("\n");
};

/**
 * Common antibiotic names database for validation
 */
export const COMMON_ANTIBIOTICS = [
  // Penicillins
  'Penicillin', 'Amoxicillin', 'Ampicillin', 'Cloxacillin',
  
  // Cephalosporins
  'Ceftiofur', 'Cephalexin', 'Cefquinome',
  
  // Tetracyclines
  'Oxytetracycline', 'Tetracycline', 'Doxycycline',
  
  // Fluoroquinolones
  'Enrofloxacin', 'Ciprofloxacin', 'Marbofloxacin',
  
  // Aminoglycosides
  'Streptomycin', 'Gentamicin', 'Neomycin',
  
  // Macrolides
  'Tylosin', 'Tilmicosin', 'Erythromycin',
  
  // Sulfonamides
  'Sulfadimidine', 'Sulfamethoxazole', 'Trimethoprim',
  
  // Others
  'Colistin', 'Lincomycin', 'Florfenicol'
];

/**
 * Get antibiotic risk category
 */
export const getAntibioticRiskCategory = (antibioticName: string): string => {
  const name = antibioticName.toLowerCase();
  
  const criticallyImportant = [
    'fluoroquinolone', 'ciprofloxacin', 'enrofloxacin',
    'cephalosporin', 'colistin', 'polymyxin'
  ];
  
  const highlyImportant = [
    'penicillin', 'amoxicillin', 'ampicillin',
    'tetracycline', 'oxytetracycline', 'macrolide'
  ];
  
  if (criticallyImportant.some(ab => name.includes(ab))) {
    return "CRITICALLY IMPORTANT";
  } else if (highlyImportant.some(ab => name.includes(ab))) {
    return "HIGHLY IMPORTANT";
  } else {
    return "IMPORTANT";
  }
};
