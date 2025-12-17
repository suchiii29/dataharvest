import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  QrCode,
  FileText,
  TrendingUp,
  BarChart3,
  Download,
} from "lucide-react";

import { generateReport } from "@/utils/report";

/* =======================
   Types
======================= */
interface Livestock {
  type: string;
  health: string;
  mrlStatus: string;
  amuUsage: string;
}

/* =======================
   Dashboard
======================= */
const Dashboard = () => {
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  /* =======================
     Fetch ALL Livestock (ADMIN)
  ======================= */
  useEffect(() => {
    const fetchAllLivestock = async () => {
      const usersSnap = await getDocs(query(
        collection(db, "users"),
        where("role", "==", "farmer")
      ));

      const allLivestock: Livestock[] = [];

      for (const user of usersSnap.docs) {
        const livestockSnap = await getDocs(
          collection(db, "users", user.id, "livestock")
        );

        livestockSnap.forEach(doc => {
          allLivestock.push(doc.data() as Livestock);
        });
      }

      setLivestock(allLivestock);

      // Alerts logic
      const generatedAlerts = [];

      if (allLivestock.some(l => l.amuUsage === "high")) {
        generatedAlerts.push({
          id: 1,
          message: "High AMU detected",
          severity: "high",
          time: "Just now",
        });
      }

      if (allLivestock.some(l => l.mrlStatus === "warning")) {
        generatedAlerts.push({
          id: 2,
          message: "MRL approaching unsafe limit",
          severity: "medium",
          time: "Recently",
        });
      }

      setAlerts(generatedAlerts);
    };

    fetchAllLivestock();
  }, []);

  /* =======================
     Calculations
  ======================= */
  const totalLivestock = livestock.length;

  const activeMonitoring = livestock.filter(
    l => l.health === "monitoring"
  ).length;

  const qrCodesGenerated = livestock.length;

  const complianceReports = livestock.filter(
    l => l.mrlStatus === "compliant"
  ).length;

  const calcPercent = (filterFn: (l: Livestock) => boolean) =>
    totalLivestock === 0
      ? 0
      : Math.round(
          (livestock.filter(filterFn).length / totalLivestock) * 100
        );

  const mrlData = [
    {
      name: "Antibiotics",
      percentage: calcPercent(l => l.amuUsage !== "low"),
      color: "bg-yellow-500",
    },
    {
      name: "Pesticides",
      percentage: calcPercent(l => l.mrlStatus === "warning"),
      color: "bg-green-500",
    },
    {
      name: "Growth Hormones",
      percentage: calcPercent(l => l.health === "monitoring"),
      color: "bg-blue-500",
    },
  ];

  /* =======================
     UI
  ======================= */
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Farm Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your farm overview.
          </p>
        </div>
        <Button onClick={generateReport}>
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Alerts */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto text-green-500 h-10 w-10" />
              <p>No active alerts</p>
            </div>
          ) : (
            alerts.map(a => (
              <div
                key={a.id}
                className="flex justify-between bg-muted p-3 rounded mb-2"
              >
                <Badge>{a.severity}</Badge>
                <span>{a.message}</span>
                <span className="text-sm text-muted-foreground">
                  {a.time}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Total Livestock" value={totalLivestock} icon={Activity} />
        <Stat label="Active Monitoring" value={activeMonitoring} icon={Activity} />
        <Stat label="QR Codes Generated" value={qrCodesGenerated} icon={QrCode} />
        <Stat label="Compliance Reports" value={complianceReports} icon={FileText} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="monitoring">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="monitoring">MRL/AMU Monitoring</TabsTrigger>
          <TabsTrigger value="livestock">Livestock Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Maximum Residue Limits (MRL)</CardTitle>
            </CardHeader>
            <CardContent>
              {mrlData.map(item => (
                <div key={item.name} className="mb-4">
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{item.percentage}% of limit</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded">
                    <div
                      className={`${item.color} h-3 rounded`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <BarChart3 /> Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-10">
              <p className="text-2xl font-bold text-green-600">
                {calcPercent(l => l.mrlStatus === "compliant")}% Compliance
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* =======================
   Small Stat Card
======================= */
const Stat = ({ label, value, icon: Icon }: any) => (
  <Card>
    <CardContent className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="bg-green-100 p-3 rounded-full">
        <Icon className="text-green-600" />
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;
