import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateReport } from "@/utils/report";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  QrCode,
  FileText,
  Download
} from "lucide-react";

const Dashboard = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, message: "High AMU detected in Cattle Group A", severity: "high", time: "2 hours ago" },
    { id: 2, message: "MRL approaching limit for Batch B204", severity: "medium", time: "4 hours ago" },
    { id: 3, message: "QR code scan required for new livestock", severity: "low", time: "1 day ago" },
  ]);

  const livestockStats = [
    { label: "Total Livestock", value: "1,247", icon: Activity, trend: "+12%" },
    { label: "Active Monitoring", value: "1,198", icon: Activity, trend: "+5%" },
    { label: "QR Codes Generated", value: "2,847", icon: QrCode, trend: "+8%" },
    { label: "Compliance Reports", value: "156", icon: FileText, trend: "+15%" },
  ];

  const mrlData = [
    { name: "Antibiotics", percentage: 75, color: "bg-yellow-500" },
    { name: "Pesticides", percentage: 45, color: "bg-green-500" },
    { name: "Growth Hormones", percentage: 32, color: "bg-blue-500" },
  ];

  const livestockGroups = [
    { group: "Cattle Group A", count: 245, status: "healthy" },
    { group: "Cattle Group B", count: 187, status: "monitoring" },
    { group: "Poultry Farm 1", count: 1850, status: "healthy" },
    { group: "Sheep Herd C", count: 94, status: "alert" },
  ];

  const recentScans = [
    { id: "QR001", animal: "Cow #1247", time: "10 min ago", status: "verified" },
    { id: "QR002", animal: "Pig #0892", time: "25 min ago", status: "verified" },
    { id: "QR003", animal: "Sheep #0445", time: "1 hour ago", status: "pending" },
    { id: "QR004", animal: "Cow #1203", time: "2 hours ago", status: "verified" },
  ];
  const handleGenerateReport = async () => {
         await generateReport();
         alert("Report saved to database ✅");
    };
 

  const handleDismissAlert = async (id: number) => {
      await dismissAlert(String(id));
      setAlerts(alerts.filter(alert => alert.id !== id));
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farm Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your farm overview.</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={handleGenerateReport}
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Alert Section */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Active Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <Badge 
                      variant={alert.severity === "high" ? "destructive" : alert.severity === "medium" ? "default" : "outline"}
                    >
                      {alert.severity}
                    </Badge>
                    <span className="flex-1">{alert.message}</span>
                    <span className="text-sm text-muted-foreground">{alert.time}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDismissAlert(alert.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No active alerts</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {livestockStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitoring">MRL/AMU Monitoring</TabsTrigger>
          <TabsTrigger value="livestock">Livestock Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maximum Residue Limits (MRL) Status</CardTitle>
              <CardDescription>Current status of chemical residues in livestock products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mrlData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.percentage}% of limit</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${item.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              ))}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">All levels within safe limits</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your livestock products meet all regulatory MRL requirements
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="livestock" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Livestock Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {livestockGroups.map((group) => (
                    <div key={group.group} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div>
                        <p className="font-medium">{group.group}</p>
                        <p className="text-sm text-muted-foreground">{group.count} animals</p>
                      </div>
                      <Badge 
                        variant={group.status === "healthy" ? "default" : group.status === "alert" ? "destructive" : "outline"}
                        className={
                          group.status === "healthy" ? "bg-green-100 text-green-800" :
                          group.status === "alert" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {group.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent QR Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{scan.animal}</p>
                        <p className="text-sm text-muted-foreground">{scan.id} • {scan.time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle 
                          className={`h-4 w-4 ${scan.status === "verified" ? "text-green-600" : "text-gray-400"}`} 
                        />
                        <span className="text-sm capitalize">{scan.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Farm Analytics</span>
              </CardTitle>
              <CardDescription>Comprehensive insights into your farm operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Advanced analytics dashboard</p>
                <p className="text-sm mb-6">Track trends, predict issues, and optimize your farm operations</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">92%</p>
                    <p className="text-sm">Compliance Rate</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">15%</p>
                    <p className="text-sm">AMU Reduction</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">98%</p>
                    <p className="text-sm">Traceability Coverage</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;