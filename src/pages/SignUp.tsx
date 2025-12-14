import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Leaf, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    userType: "",
    phoneNumber: "",
    farmName: "",
    farmLocation: "",
    livestockType: "",
    farmSize: "",
    licenseNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (!formData.userType) {
      return setError("Please select your role");
    }

    if (!formData.fullName || !formData.phoneNumber) {
      return setError("Please fill in all required fields");
    }

    // Additional validation for farmers
    if (formData.userType === "farmer" && (!formData.farmName || !formData.farmLocation || !formData.livestockType)) {
      return setError("Please complete all farm details");
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password);
      // TODO: Save additional user data to your database
      console.log("User registered with data:", formData);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left side - Benefits */}
        <div className="hidden lg:block lg:col-span-2 space-y-8 sticky top-24">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Join DataHarvest Today
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage your livestock with cutting-edge technology
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Real-time MRL & AMU monitoring",
              "Blockchain traceability system",
              "AI-powered health analytics",
              "Compliance with global standards",
              "Transparent farm-to-fork tracking",
            ].map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <p className="text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Form */}
        <Card className="w-full lg:col-span-3 shadow-strong border-0">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-medium">
                <Leaf className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="text-base">
              Join our livestock management platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-destructive/50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* User Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="userType" className="text-sm font-medium">
                  I am a <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.userType} onValueChange={(value) => handleChange("userType", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer / Livestock Owner</SelectItem>
                    <SelectItem value="veterinarian">Veterinarian</SelectItem>
                    <SelectItem value="inspector">Government Inspector</SelectItem>
                    <SelectItem value="consumer">Consumer</SelectItem>
                    <SelectItem value="distributor">Distributor / Retailer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Farmer Specific Fields */}
              {(formData.userType === "farmer" || formData.userType === "distributor") && (
                <>
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-lg">
                      {formData.userType === "farmer" ? "Farm Details" : "Business Details"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmName" className="text-sm font-medium">
                          {formData.userType === "farmer" ? "Farm Name" : "Business Name"} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="farmName"
                          type="text"
                          placeholder={formData.userType === "farmer" ? "Green Valley Farm" : "ABC Distributors"}
                          value={formData.farmName}
                          onChange={(e) => handleChange("farmName", e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber" className="text-sm font-medium">
                          License / Registration Number
                        </Label>
                        <Input
                          id="licenseNumber"
                          type="text"
                          placeholder="REG12345"
                          value={formData.licenseNumber}
                          onChange={(e) => handleChange("licenseNumber", e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="farmLocation" className="text-sm font-medium">
                        Location <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="farmLocation"
                        type="text"
                        placeholder="City, State, Country"
                        value={formData.farmLocation}
                        onChange={(e) => handleChange("farmLocation", e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    {formData.userType === "farmer" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="livestockType" className="text-sm font-medium">
                            Livestock Type <span className="text-destructive">*</span>
                          </Label>
                          <Select value={formData.livestockType} onValueChange={(value) => handleChange("livestockType", value)}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select livestock" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cattle">Cattle</SelectItem>
                              <SelectItem value="poultry">Poultry</SelectItem>
                              <SelectItem value="sheep">Sheep</SelectItem>
                              <SelectItem value="goat">Goat</SelectItem>
                              <SelectItem value="pig">Pig</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="farmSize" className="text-sm font-medium">
                            Farm Size
                          </Label>
                          <Select value={formData.farmSize} onValueChange={(value) => handleChange("farmSize", value)}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small (1-50 animals)</SelectItem>
                              <SelectItem value="medium">Medium (51-200 animals)</SelectItem>
                              <SelectItem value="large">Large (201-1000 animals)</SelectItem>
                              <SelectItem value="industrial">Industrial (1000+ animals)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Password Fields */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-lg">Security</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-primary text-white shadow-medium hover:shadow-strong transition-smooth" 
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-2"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline font-semibold">
                Sign in here
              </Link>
            </p>

            <p className="text-xs text-center text-muted-foreground pt-4">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;