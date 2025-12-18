import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  QrCode,
  FileText,
  TrendingUp,
  BarChart3,
  Download,
  Loader2,
} from "lucide-react";

/* =======================
   Types
======================= */
interface Livestock {
  id: string;
  ownerName: string;
  type: string;
  breed: string;
  ageMonths: number;
  weightKg: number;
  antibioticUsed: boolean;
  antibioticName?: string;
  lastDoseDate: string;
  withdrawalDays: number;
  amuScore: number;
  amuLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  mrlStatus: "COMPLIANT" | "NOT COMPLIANT" | "PENDING" | "SAFE";
  healthStatus: string;
  vaccinationStatus: boolean;
  createdAt: any;
}

interface AlertItem {
  id: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  time: string;
  animalId: string;
  type: string;
}

/* =======================
   Dashboard Component
======================= */
export default function Dashboard() {
  const { user } = useAuth();
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     Fetch Livestock Data
  ======================= */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const livestockRef = collection(db, "users", user.uid, "livestock");

    const unsubscribe = onSnapshot(livestockRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Livestock, "id">),
      }));

      setLivestock(data);
      generateAlerts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  /* =======================
     Generate Alerts
  ======================= */
  const generateAlerts = (livestockData: Livestock[]) => {
    const newAlerts: AlertItem[] = [];

    livestockData.forEach((animal) => {
      if (animal.amuLevel === "CRITICAL") {
        newAlerts.push({
          id: `critical-${animal.id}`,
          message: `CRITICAL AMU Risk: ${animal.type} (${animal.breed}) - Owner: ${animal.ownerName}`,
          severity: "critical",
          time: "Now",
          animalId: animal.id,
          type: "AMU_CRITICAL",
        });
      }

      if (animal.amuLevel === "HIGH") {
        newAlerts.push({
          id: `high-${animal.id}`,
          message: `High AMU Risk: ${animal.type} (${animal.breed}) - Score: ${animal.amuScore}`,
          severity: "high",
          time: "Now",
          animalId: animal.id,
          type: "AMU_HIGH",
        });
      }

      if (animal.mrlStatus === "NOT COMPLIANT") {
        const daysRemaining = calculateDaysRemaining(
          animal.lastDoseDate,
          animal.withdrawalDays
        );
        newAlerts.push({
          id: `mrl-${animal.id}`,
          message: `MRL Non-Compliant: ${animal.type} - ${daysRemaining} days remaining`,
          severity: "high",
          time: "Now",
          animalId: animal.id,
          type: "MRL_NON_COMPLIANT",
        });
      }

      if (animal.healthStatus.toLowerCase() === "poor") {
        newAlerts.push({
          id: `health-${animal.id}`,
          message: `Poor Health: ${animal.type} (${animal.ownerName}) - Veterinary attention needed`,
          severity: "high",
          time: "Now",
          animalId: animal.id,
          type: "HEALTH_POOR",
        });
      }

      if (!animal.vaccinationStatus) {
        newAlerts.push({
          id: `vaccine-${animal.id}`,
          message: `Vaccination Required: ${animal.type} (${animal.breed})`,
          severity: "medium",
          time: "Now",
          animalId: animal.id,
          type: "VACCINE_MISSING",
        });
      }

      if (animal.ageMonths < 6 && animal.weightKg < 50) {
        newAlerts.push({
          id: `young-${animal.id}`,
          message: `Young & Underweight: ${animal.type} - Extra monitoring required`,
          severity: "medium",
          time: "Now",
          animalId: animal.id,
          type: "YOUNG_UNDERWEIGHT",
        });
      }
    });

    setAlerts(newAlerts);
  };

  const calculateDaysRemaining = (lastDoseDate: string, withdrawalDays: number): number => {
    if (!lastDoseDate) return 0;
    const today = new Date();
    const doseDate = new Date(lastDoseDate);
    const daysSinceDose = Math.floor(
      (today.getTime() - doseDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, withdrawalDays - daysSinceDose);
  };

  const stats = {
    total: livestock.length,
    activeMonitoring: livestock.filter(
      (a) => a.antibioticUsed && a.mrlStatus === "NOT COMPLIANT"
    ).length,
    qrGenerated: livestock.length,
    compliantReports: livestock.filter((a) => a.mrlStatus === "COMPLIANT" || a.mrlStatus === "SAFE").length,
    criticalRisk: livestock.filter((a) => a.amuLevel === "CRITICAL").length,
    highRisk: livestock.filter((a) => a.amuLevel === "HIGH").length,
    moderateRisk: livestock.filter((a) => a.amuLevel === "MODERATE").length,
    lowRisk: livestock.filter((a) => a.amuLevel === "LOW").length,
    nonCompliant: livestock.filter((a) => a.mrlStatus === "NOT COMPLIANT").length,
    antibioticUsage: livestock.filter((a) => a.antibioticUsed).length,
    poorHealth: livestock.filter((a) => a.healthStatus.toLowerCase() === "poor").length,
    unvaccinated: livestock.filter((a) => !a.vaccinationStatus).length,
  };

  const mrlData = [
    {
      name: "Antibiotic Usage",
      count: stats.antibioticUsage,
      total: stats.total,
      percentage: stats.total ? Math.round((stats.antibioticUsage / stats.total) * 100) : 0,
      color: "bg-yellow-500",
    },
    {
      name: "MRL Compliant",
      count: stats.compliantReports,
      total: stats.total,
      percentage: stats.total ? Math.round((stats.compliantReports / stats.total) * 100) : 0,
      color: "bg-green-500",
    },
    {
      name: "High AMU Risk",
      count: stats.highRisk + stats.criticalRisk,
      total: stats.total,
      percentage: stats.total
        ? Math.round(((stats.highRisk + stats.criticalRisk) / stats.total) * 100)
        : 0,
      color: "bg-red-500",
    },
  ];

  const amuDistribution = [
    { level: "Low Risk", count: stats.lowRisk, color: "bg-green-500" },
    { level: "Moderate", count: stats.moderateRisk, color: "bg-yellow-500" },
    { level: "High Risk", count: stats.highRisk, color: "bg-orange-500" },
    { level: "Critical", count: stats.criticalRisk, color: "bg-red-600" },
  ];

  const typeDistribution = livestock.reduce((acc, animal) => {
    acc[animal.type] = (acc[animal.type] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalAnimals: stats.total,
        compliant: stats.compliantReports,
        nonCompliant: stats.nonCompliant,
        criticalRisk: stats.criticalRisk,
        highRisk: stats.highRisk,
      },
      alerts: alerts.length,
      livestock: livestock.map((a) => ({
        owner: a.ownerName,
        type: a.type,
        breed: a.breed,
        amuLevel: a.amuLevel,
        amuScore: a.amuScore,
        mrlStatus: a.mrlStatus,
        healthStatus: a.healthStatus,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `livestock-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Farm Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time livestock monitoring & compliance tracking
          </p>
        </div>
        <Button onClick={generateReport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {alerts.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between bg-muted p-3 rounded"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      alert.severity === "critical" || alert.severity === "high"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className="text-sm">{alert.message}</span>
                </div>
                <span className="text-xs text-muted-foreground">{alert.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {alerts.length === 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500 h-6 w-6" />
              <div>
                <p className="font-medium">All Clear!</p>
                <p className="text-sm text-gray-600">No active alerts at this time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Livestock"
          value={stats.total}
          icon={Activity}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Active Monitoring"
          value={stats.activeMonitoring}
          icon={TrendingUp}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          label="QR Codes Generated"
          value={stats.qrGenerated}
          icon={QrCode}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          label="Compliance Reports"
          value={stats.compliantReports}
          icon={FileText}
          color="bg-green-100 text-green-600"
        />
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="monitoring">MRL/AMU Monitoring</TabsTrigger>
          <TabsTrigger value="livestock">Livestock Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maximum Residue Limits (MRL) Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mrlData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-600">
                      {item.count} / {item.total} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-4 transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AMU Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {amuDistribution.map((item) => (
                  <div key={item.level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="text-sm">{item.level}</span>
                    </div>
                    <span className="font-bold">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <MetricRow label="Poor Health" value={stats.poorHealth} total={stats.total} />
                <MetricRow label="Unvaccinated" value={stats.unvaccinated} total={stats.total} />
                <MetricRow label="Non-Compliant" value={stats.nonCompliant} total={stats.total} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="livestock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Livestock by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(typeDistribution).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(typeDistribution).map(([type, count]) => (
                    <div key={type} className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-gray-600">{type}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-6">
                  No livestock data available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Animals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {livestock.slice(0, 5).map((animal) => (
                  <div
                    key={animal.id}
                    className="flex items-center justify-between p-3 bg-muted rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {animal.type} - {animal.breed}
                      </p>
                      <p className="text-sm text-gray-600">Owner: {animal.ownerName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          animal.amuLevel === "LOW"
                            ? "secondary"
                            : animal.amuLevel === "MODERATE"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {animal.amuLevel}
                      </Badge>
                      <Badge
                        variant={
                          animal.mrlStatus === "COMPLIANT" || animal.mrlStatus === "SAFE"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {animal.mrlStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
                {livestock.length === 0 && (
                  <p className="text-center text-gray-600 py-6">
                    No livestock added yet. Start by adding your first animal!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 /> Farm Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <p className="text-4xl font-bold text-green-600">
                    {stats.total
                      ? Math.round((stats.compliantReports / stats.total) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-gray-600 mt-2">MRL Compliance Rate</p>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <p className="text-4xl font-bold text-blue-600">
                    {stats.total
                      ? Math.round((stats.lowRisk / stats.total) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Low AMU Risk Animals</p>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-lg">
                  <p className="text-4xl font-bold text-orange-600">
                    {stats.total
                      ? Math.round((stats.antibioticUsage / stats.total) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Antibiotic Usage Rate</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">Key Insights</h3>
                <div className="space-y-2">
                  <InsightRow
                    icon={CheckCircle}
                    text={`${stats.compliantReports} animals are MRL compliant`}
                    positive
                  />
                  {stats.criticalRisk > 0 && (
                    <InsightRow
                      icon={AlertTriangle}
                      text={`${stats.criticalRisk} animals require immediate attention (CRITICAL risk)`}
                      positive={false}
                    />
                  )}
                  {stats.nonCompliant > 0 && (
                    <InsightRow
                      icon={AlertTriangle}
                      text={`${stats.nonCompliant} animals in withdrawal period`}
                      positive={false}
                    />
                  )}
                  {stats.unvaccinated > 0 && (
                    <InsightRow
                      icon={AlertTriangle}
                      text={`${stats.unvaccinated} animals need vaccination`}
                      positive={false}
                    />
                  )}
                  {stats.total === 0 && (
                    <InsightRow
                      icon={AlertTriangle}
                      text="No livestock data available. Add animals to see insights."
                      positive={false}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const MetricRow = ({ label, value, total }: any) => {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        <span className="text-xs text-gray-500">({percentage}%)</span>
      </div>
    </div>
  );
};

const InsightRow = ({ icon: Icon, text, positive }: any) => (
  <div className="flex items-center gap-2">
    <Icon className={`h-4 w-4 ${positive ? "text-green-600" : "text-orange-600"}`} />
    <span className="text-sm">{text}</span>
  </div>
);