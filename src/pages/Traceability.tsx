import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const Traceability = () => {
  const [searchCode, setSearchCode] = useState("");
  const [traceResult, setTraceResult] = useState(null);

  const mockTraceData = {
    "QR-COW-1247": {
      productId: "BEEF-2024-1247",
      productName: "Premium Beef Cut",
      origin: {
        farm: "Green Valley Farm",
        location: "Maharashtra, India",
        farmer: "Rajesh Kumar",
        date: "2024-08-15",
      },
      livestock: {
        id: "COW-1247",
        breed: "Holstein",
        age: "3 years",
        health: "Certified Healthy",
        mrlStatus: "Compliant",
        amuUsage: "None in last 60 days",
      },
      processing: {
        facility: "Premium Processing Plant",
        date: "2024-09-10",
        batchId: "BATCH-2024-0892",
        certifications: ["HACCP", "ISO 22000", "Organic"],
      },
      distribution: {
        distributor: "Fresh Foods Ltd",
        transportDate: "2024-09-12",
        temperature: "2-4°C maintained",
        trackingId: "TRK-FF-2024-1247",
      },
      retail: {
        store: "SuperMarket Plus",
        location: "Mumbai, Maharashtra",
        shelfDate: "2024-09-14",
        expiryDate: "2024-09-21",
      },
    },
  };

  const handleSearch = () => {
    if (searchCode && mockTraceData[searchCode]) {
      setTraceResult(mockTraceData[searchCode]);
    } else {
      setTraceResult(null);
    }
  };

  const recentScans = [
    { code: "QR-COW-1247", product: "Premium Beef Cut", time: "2 hours ago", location: "Mumbai" },
    { code: "QR-PIG-0892", product: "Pork Shoulder", time: "4 hours ago", location: "Pune" },
    { code: "QR-SHEEP-0445", product: "Lamb Chops", time: "6 hours ago", location: "Nashik" },
    { code: "QR-COW-1203", product: "Organic Beef", time: "8 hours ago", location: "Delhi" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Food Traceability</h1>
          <p className="text-muted-foreground">Track products from farm to consumer with QR codes</p>
        </div>
        <Button className="bg-gradient-secondary">
          <Scan className="h-4 w-4 mr-2" />
          Scan QR Code
        </Button>
      </div>

      {/* Search Section */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Product Traceability Search</span>
          </CardTitle>
          <CardDescription>
            Enter a QR code or product ID to trace the complete journey from farm to consumer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Enter QR code (e.g., QR-COW-1247)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-gradient-primary">
              Trace Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trace Results */}
      {traceResult && (
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-primary">Traceability Results</CardTitle>
            <CardDescription>Complete journey of {traceResult.productName}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Journey Timeline */}
            <div className="space-y-6">
              {/* Farm Origin */}
              <div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg border-l-4 border-l-primary">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Farm Origin</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Farm</p>
                      <p className="font-medium">{traceResult.origin.farm}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{traceResult.origin.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Farmer</p>
                      <p className="font-medium">{traceResult.origin.farmer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Harvest Date</p>
                      <p className="font-medium">{traceResult.origin.date}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-background rounded border">
                    <h4 className="font-medium mb-2">Livestock Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">ID:</span> {traceResult.livestock.id}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Breed:</span> {traceResult.livestock.breed}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Age:</span> {traceResult.livestock.age}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{traceResult.livestock.health}</Badge>
                      <Badge variant="outline">{traceResult.livestock.mrlStatus}</Badge>
                      <Badge variant="outline">AMU: {traceResult.livestock.amuUsage}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <ArrowRight className="mx-auto h-6 w-6 text-muted-foreground" />

              {/* Processing */}
              <div className="flex items-start space-x-4 p-4 bg-secondary/5 rounded-lg border-l-4 border-l-secondary">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Processing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Facility</p>
                      <p className="font-medium">{traceResult.processing.facility}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Processing Date</p>
                      <p className="font-medium">{traceResult.processing.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Batch ID</p>
                      <p className="font-medium">{traceResult.processing.batchId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Certifications</p>
                      <div className="flex space-x-1">
                        {traceResult.processing.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ArrowRight className="mx-auto h-6 w-6 text-muted-foreground" />

              {/* Distribution */}
              <div className="flex items-start space-x-4 p-4 bg-accent/5 rounded-lg border-l-4 border-l-accent">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Distributor</p>
                      <p className="font-medium">{traceResult.distribution.distributor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transport Date</p>
                      <p className="font-medium">{traceResult.distribution.transportDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Temperature</p>
                      <p className="font-medium">{traceResult.distribution.temperature}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tracking ID</p>
                      <p className="font-medium">{traceResult.distribution.trackingId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <ArrowRight className="mx-auto h-6 w-6 text-muted-foreground" />

              {/* Retail */}
              <div className="flex items-start space-x-4 p-4 bg-muted/5 rounded-lg border-l-4 border-l-muted-foreground">
                <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Retail</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Store</p>
                      <p className="font-medium">{traceResult.retail.store}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{traceResult.retail.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Shelf Date</p>
                      <p className="font-medium">{traceResult.retail.shelfDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="font-medium">{traceResult.retail.expiryDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent QR Code Scans</span>
          </CardTitle>
          <CardDescription>Latest product traceability requests from consumers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentScans.map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-smooth">
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{scan.product}</p>
                    <p className="text-sm text-muted-foreground">{scan.code}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{scan.location}</span>
                  </div>
                  <span>{scan.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consumer Portal CTA */}
      <Card className="bg-gradient-hero text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Consumer Transparency Portal</h3>
          <p className="mb-6 opacity-90">
            Empower consumers to verify the authenticity and safety of their food products
          </p>
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Launch Consumer Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Traceability;