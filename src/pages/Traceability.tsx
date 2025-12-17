import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  QrCode,
  MapPin,
  Calendar,
  Truck,
  Store,
  CheckCircle,
  ArrowRight,
  Scan,
} from "lucide-react";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const Traceability = () => {
  const [searchCode, setSearchCode] = useState("");
  const [traceResult, setTraceResult] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔍 SEARCH BY QR CODE
  const handleSearch = async () => {
    if (!searchCode) return;
    setLoading(true);

    const q = query(
      collection(db, "traceability"),
      where("qrCode", "==", searchCode)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      setTraceResult(data);

      // log scan
      await addDoc(collection(db, "qrScans"), {
        qrCode: searchCode,
        product: data.productName,
        location: "Unknown",
        createdAt: serverTimestamp(),
      });

      fetchRecentScans();
    } else {
      setTraceResult(null);
    }

    setLoading(false);
  };

  // 🕒 FETCH RECENT SCANS
  const fetchRecentScans = async () => {
    const snap = await getDocs(collection(db, "qrScans"));
    const scans: any[] = [];

    snap.forEach((doc) => {
      scans.push({ id: doc.id, ...doc.data() });
    });

    setRecentScans(scans.slice(0, 5));
  };

  useEffect(() => {
    fetchRecentScans();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Food Traceability</h1>
          <p className="text-muted-foreground">
            Track products from farm to consumer with QR codes
          </p>
        </div>
        <Button className="bg-gradient-secondary">
          <Scan className="h-4 w-4 mr-2" /> Scan QR Code
        </Button>
      </div>

      {/* SEARCH */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Product Traceability Search
          </CardTitle>
          <CardDescription>
            Enter QR code to view full product journey
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            placeholder="Enter QR code (QR-COW-1247)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Trace Product"}
          </Button>
        </CardContent>
      </Card>

      {/* RESULT */}
      {traceResult && (
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle>Traceability Results</CardTitle>
            <CardDescription>{traceResult.productName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* FARM */}
            <Timeline icon={<MapPin />} title="Farm Origin">
              <Info label="Farm" value={traceResult.origin.farm} />
              <Info label="Location" value={traceResult.origin.location} />
              <Info label="Farmer" value={traceResult.origin.farmer} />
              <Info label="Date" value={traceResult.origin.date} />
            </Timeline>

            <ArrowRight className="mx-auto" />

            {/* PROCESSING */}
            <Timeline icon={<CheckCircle />} title="Processing">
              <Info label="Facility" value={traceResult.processing.facility} />
              <Info label="Batch" value={traceResult.processing.batchId} />
            </Timeline>

            <ArrowRight className="mx-auto" />

            {/* DISTRIBUTION */}
            <Timeline icon={<Truck />} title="Distribution">
              <Info label="Distributor" value={traceResult.distribution.distributor} />
              <Info label="Tracking ID" value={traceResult.distribution.trackingId} />
            </Timeline>

            <ArrowRight className="mx-auto" />

            {/* RETAIL */}
            <Timeline icon={<Store />} title="Retail">
              <Info label="Store" value={traceResult.retail.store} />
              <Info label="Expiry" value={traceResult.retail.expiryDate} />
            </Timeline>
          </CardContent>
        </Card>
      )}

      {/* RECENT SCANS */}
      <Card>
        <CardHeader>
          <CardTitle>Recent QR Code Scans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentScans.map((scan) => (
            <div key={scan.id} className="flex justify-between p-3 bg-muted rounded">
              <div className="flex gap-2">
                <QrCode />
                <div>
                  <p className="font-medium">{scan.product}</p>
                  <p className="text-sm">{scan.qrCode}</p>
                </div>
              </div>
              <Badge variant="outline">Scanned</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const Timeline = ({ icon, title, children }: any) => (
  <div className="p-4 border-l-4 rounded bg-muted/30">
    <div className="flex items-center gap-2 mb-3">
      {icon} <h3 className="font-semibold">{title}</h3>
    </div>
    <div className="grid grid-cols-2 gap-3">{children}</div>
  </div>
);

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default Traceability;