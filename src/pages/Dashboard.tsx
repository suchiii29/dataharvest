import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  QrCode,
  FileText,
} from "lucide-react";

const Dashboard = () => {
  const alerts = [
    { id: 1, message: "High AMU detected in Cattle Group A", severity: "high", time: "2 hours ago" },
    { id: 2, message: "MRL approaching limit for Batch B204", severity: "medium", time: "4 hours ago" },
    { id: 3, message: "QR code scan required for new livestock", severity: "low", time: "1 day ago" },
  ];

  const livestockStats = [
    { label: "Total Livestock", value: "1,247", icon: Activity, trend: "+12%" },
    { label: "Active Monitoring", value: "1,198", icon: Activity, trend: "+5%" },
    { label: "QR Codes Generated", value: "2,847", icon: QrCode, trend: "+8%" },
    { label: "Compliance Reports", value: "156", icon: FileText, trend: "+15%" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farm Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your farm overview.</p>
        </div>
        <Button className="bg-gradient-primary">
          Generate Report
        </Button>
      </div>

      {/* Alert Section */}
      <Card className="border-l-4 border-l-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Active Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={alert.severity === "high" ? "destructive" : alert.severity === "medium" ? "secondary" : "outline"}
                  >
                    {alert.severity}
                  </Badge>
                  <span>{alert.message}</span>
                </div>
                <span className="text-sm text-muted-foreground">{alert.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {livestockStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-soft hover:shadow-medium transition-smooth">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-primary flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
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
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Antibiotics</span>
                    <span className="text-sm text-muted-foreground">75% of limit</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Pesticides</span>
                    <span className="text-sm text-muted-foreground">45% of limit</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Growth Hormones</span>
                    <span className="text-sm text-muted-foreground">32% of limit</span>
                  </div>
                  <Progress value={32} className="h-2" />
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
                  {[
                    { group: "Cattle Group A", count: 245, status: "healthy" },
                    { group: "Cattle Group B", count: 187, status: "monitoring" },
                    { group: "Poultry Farm 1", count: 1850, status: "healthy" },
                    { group: "Sheep Herd C", count: 94, status: "alert" },
                  ].map((group) => (
                    <div key={group.group} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{group.group}</p>
                        <p className="text-sm text-muted-foreground">{group.count} animals</p>
                      </div>
                      <Badge 
                        variant={group.status === "healthy" ? "secondary" : group.status === "alert" ? "destructive" : "outline"}
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
                  {[
                    { id: "QR001", animal: "Cow #1247", time: "10 min ago", status: "verified" },
                    { id: "QR002", animal: "Pig #0892", time: "25 min ago", status: "verified" },
                    { id: "QR003", animal: "Sheep #0445", time: "1 hour ago", status: "pending" },
                    { id: "QR004", animal: "Cow #1203", time: "2 hours ago", status: "verified" },
                  ].map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{scan.animal}</p>
                        <p className="text-sm text-muted-foreground">{scan.id} • {scan.time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle 
                          className={`h-4 w-4 ${scan.status === "verified" ? "text-primary" : "text-muted-foreground"}`} 
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
                <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                <p>Advanced analytics dashboard coming soon</p>
                <p className="text-sm">Track trends, predict issues, and optimize your farm operations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;