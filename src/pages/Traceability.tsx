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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Utensils,
  Calendar,
  Truck,
  Package,
  CheckCircle,
  Plus,
  Loader2,
  Leaf,
  Factory,
  BarChart3,
  Clock,
} from "lucide-react";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";

/* =======================
   Types
======================= */
interface FeedRecord {
  id: string;
  animalId: string;
  animalType: string;
  animalBreed: string;
  ownerName: string;
  feedType: string;
  feedSupplier: string;
  feedBatchNumber: string;
  feedingDate: string;
  quantity: string;
  feedSource: string;
  notes: string;
  createdAt: any;
}

interface LivestockData {
  id: string;
  ownerName: string;
  type: string;
  breed: string;
}

/* =======================
   Main Component
======================= */
const Traceability = () => {
  const { user } = useAuth();
  const [livestock, setLivestock] = useState<LivestockData[]>([]);
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FeedRecord[]>([]);
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form State
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [feedType, setFeedType] = useState("");
  const [feedSupplier, setFeedSupplier] = useState("");
  const [feedBatch, setFeedBatch] = useState("");
  const [feedDate, setFeedDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [feedSource, setFeedSource] = useState("");
  const [notes, setNotes] = useState("");

  /* =======================
     FETCH LIVESTOCK
  ======================= */
  useEffect(() => {
    if (!user) return;

    const livestockRef = collection(db, "users", user.uid, "livestock");
    const unsubscribe = onSnapshot(livestockRef, (snapshot) => {
      const data: LivestockData[] = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ownerName: doc.data().ownerName,
          type: doc.data().type,
          breed: doc.data().breed,
        });
      });
      setLivestock(data);
    });

    return () => unsubscribe();
  }, [user]);

  /* =======================
     FETCH FEED RECORDS
  ======================= */
  useEffect(() => {
    if (!user) return;

    const feedRef = collection(db, "users", user.uid, "feedRecords");
    const q = query(feedRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: FeedRecord[] = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        } as FeedRecord);
      });
      setFeedRecords(data);
      setFilteredRecords(data);
    });

    return () => unsubscribe();
  }, [user]);

  /* =======================
     FILTER RECORDS
  ======================= */
  useEffect(() => {
    if (selectedAnimalFilter === "all") {
      setFilteredRecords(feedRecords);
    } else {
      setFilteredRecords(
        feedRecords.filter((record) => record.animalId === selectedAnimalFilter)
      );
    }
  }, [selectedAnimalFilter, feedRecords]);

  /* =======================
     ADD FEED RECORD
  ======================= */
  const handleAddFeed = async () => {
    if (!user) {
      alert("Please log in first!");
      return;
    }

    if (!selectedAnimal || !feedType || !feedSupplier || !feedDate) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);

    try {
      const animal = livestock.find((a) => a.id === selectedAnimal);
      if (!animal) return;

      await addDoc(collection(db, "users", user.uid, "feedRecords"), {
        animalId: selectedAnimal,
        animalType: animal.type,
        animalBreed: animal.breed,
        ownerName: animal.ownerName,
        feedType,
        feedSupplier,
        feedBatchNumber: feedBatch,
        feedingDate: feedDate,
        quantity,
        feedSource,
        notes,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setSelectedAnimal("");
      setFeedType("");
      setFeedSupplier("");
      setFeedBatch("");
      setFeedDate("");
      setQuantity("");
      setFeedSource("");
      setNotes("");
      setDialogOpen(false);

      alert("Feed record added successfully!");
    } catch (error) {
      console.error("Error adding feed:", error);
      alert("Failed to add feed record");
    }

    setLoading(false);
  };

  /* =======================
     CALCULATE STATS
  ======================= */
  const stats = {
    totalRecords: feedRecords.length,
    feedTypes: [...new Set(feedRecords.map((r) => r.feedType))].length,
    suppliers: [...new Set(feedRecords.map((r) => r.feedSupplier))].length,
    recentFeedings: feedRecords.filter((r) => {
      const feedingDate = new Date(r.feedingDate);
      const daysDiff = Math.floor(
        (new Date().getTime() - feedingDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff <= 7;
    }).length,
  };

  /* =======================
     FORMAT DATE
  ======================= */
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  /* =======================
     FEED TYPE DISTRIBUTION
  ======================= */
  const getFeedDistribution = () => {
    const distribution: { [key: string]: number } = {};
    feedRecords.forEach((record) => {
      distribution[record.feedType] = (distribution[record.feedType] || 0) + 1;
    });
    return distribution;
  };

  /* =======================
     SUPPLIER DISTRIBUTION
  ======================= */
  const getSupplierDistribution = () => {
    const distribution: { [key: string]: number } = {};
    feedRecords.forEach((record) => {
      distribution[record.feedSupplier] = (distribution[record.feedSupplier] || 0) + 1;
    });
    return distribution;
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Food Traceability</h1>
          <p className="text-gray-600 mt-1">
            Track livestock feed and diet from supplier to animal
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Feed Record
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Feed Record</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Select Animal *</Label>
                <Select onValueChange={setSelectedAnimal} value={selectedAnimal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {livestock.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.type} - {animal.breed} (Owner: {animal.ownerName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Feed Type *</Label>
                  <Select onValueChange={setFeedType} value={feedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grass/Hay">Grass/Hay</SelectItem>
                      <SelectItem value="Grain">Grain (Corn, Wheat, Barley)</SelectItem>
                      <SelectItem value="Silage">Silage</SelectItem>
                      <SelectItem value="Concentrates">Concentrates</SelectItem>
                      <SelectItem value="Mixed Feed">Mixed Feed</SelectItem>
                      <SelectItem value="Organic Feed">Organic Feed</SelectItem>
                      <SelectItem value="Pellets">Pellets</SelectItem>
                      <SelectItem value="Vegetables">Vegetables/Greens</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Feed Supplier *</Label>
                  <Input
                    placeholder="e.g., ABC Feeds Ltd"
                    value={feedSupplier}
                    onChange={(e) => setFeedSupplier(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Batch Number</Label>
                  <Input
                    placeholder="e.g., BATCH-2024-001"
                    value={feedBatch}
                    onChange={(e) => setFeedBatch(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Feed Source</Label>
                  <Select onValueChange={setFeedSource} value={feedSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Local Farm">Local Farm</SelectItem>
                      <SelectItem value="Commercial Supplier">Commercial Supplier</SelectItem>
                      <SelectItem value="Own Production">Own Production</SelectItem>
                      <SelectItem value="Import">Import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Feeding Date *</Label>
                  <Input
                    type="date"
                    value={feedDate}
                    onChange={(e) => setFeedDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Input
                    placeholder="e.g., 10kg, 2 bales"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Input
                  placeholder="Additional information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleAddFeed}
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Feed Record"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Feed Records</p>
                <p className="text-3xl font-bold mt-1">{stats.totalRecords}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Utensils className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Feed Types</p>
                <p className="text-3xl font-bold mt-1">{stats.feedTypes}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-3xl font-bold mt-1">{stats.suppliers}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Factory className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Recent (7 days)</p>
                <p className="text-3xl font-bold mt-1">{stats.recentFeedings}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Feed Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={setSelectedAnimalFilter}
            value={selectedAnimalFilter}
          >
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Animals</SelectItem>
              {livestock.map((animal) => (
                <SelectItem key={animal.id} value={animal.id}>
                  {animal.type} - {animal.breed} (Owner: {animal.ownerName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* FEED DISTRIBUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Feed Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(getFeedDistribution()).length === 0 ? (
              <p className="text-center text-gray-500 py-4">No feed data available</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(getFeedDistribution()).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">{type}</span>
                    </div>
                    <Badge>{count} records</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Supplier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(getSupplierDistribution()).length === 0 ? (
              <p className="text-center text-gray-500 py-4">No supplier data available</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(getSupplierDistribution()).map(([supplier, count]) => (
                  <div key={supplier} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">{supplier}</span>
                    </div>
                    <Badge variant="outline">{count} records</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FEED RECORDS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Feed Records ({filteredRecords.length})
          </CardTitle>
          <CardDescription>
            {selectedAnimalFilter === "all"
              ? "Showing all feed records"
              : "Showing filtered records"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Utensils className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No feed records yet</p>
              <p className="text-sm">
                Click "Add Feed Record" to start tracking livestock diet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">
                        {record.animalType} - {record.animalBreed}
                      </p>
                      <p className="text-sm text-gray-600">
                        Owner: {record.ownerName}
                      </p>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      {record.feedType}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Supplier</p>
                      <p className="font-medium">{record.feedSupplier}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Batch Number</p>
                      <p className="font-medium">{record.feedBatchNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quantity</p>
                      <p className="font-medium">{record.quantity || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="font-medium">{record.feedingDate}</p>
                    </div>
                  </div>

                  {record.feedSource && (
                    <div className="mt-3">
                      <Badge variant="outline">Source: {record.feedSource}</Badge>
                    </div>
                  )}

                  {record.notes && (
                    <p className="text-sm text-gray-600 mt-3 italic bg-white p-2 rounded">
                      {record.notes}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Added: {formatDate(record.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Traceability;