import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Eye,
} from "lucide-react";

import { calculateAMURisk, getAMULevel, calculateMRLStatus } from "@/utils/livestockCalculations";

/* =====================
   TYPES
===================== */
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
  mrlStatus: "COMPLIANT" | "NOT COMPLIANT" | "PENDING";
  healthStatus: string;
  vaccinationStatus: boolean;
  createdAt: any;
}

/* =====================
   COMPONENT
===================== */
export default function Livestock() {
  const { user } = useAuth();

  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Livestock | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  /* FORM STATE */
  const [ownerName, setOwnerName] = useState("");
  const [type, setType] = useState("");
  const [breed, setBreed] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [antibioticUsed, setAntibioticUsed] = useState(false);
  const [antibioticName, setAntibioticName] = useState("");
  const [lastDoseDate, setLastDoseDate] = useState("");
  const [withdrawalDays, setWithdrawalDays] = useState("");
  const [healthStatus, setHealthStatus] = useState("Good");
  const [vaccinationStatus, setVaccinationStatus] = useState(true);

  /* =====================
     FETCH DATA FROM FIREBASE
  ===================== */
  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "livestock");

    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Livestock, "id">),
      }));
      setLivestock(data);
    });

    return () => unsub();
  }, [user]);

  /* =====================
     SAVE TO FIREBASE
  ===================== */
  const handleSave = async () => {
    if (!user) {
      alert("Please log in first!");
      return;
    }

    if (!ownerName || !type || !breed || !ageMonths || !weightKg) {
      alert("Please fill all required fields!");
      return;
    }

    const age = Number(ageMonths);
    const weight = Number(weightKg);
    const withdrawal = Number(withdrawalDays) || 0;

    // Calculate AMU Risk Score using ML algorithm
    const amuScore = calculateAMURisk({
      type,
      ageMonths: age,
      weightKg: weight,
      antibioticUsed,
      withdrawalDays: withdrawal,
      lastDoseDate,
      healthStatus,
      vaccinationStatus,
    });

    const amuLevel = getAMULevel(amuScore);
    const mrlStatus = calculateMRLStatus(lastDoseDate, withdrawal);

    try {
      await addDoc(collection(db, "users", user.uid, "livestock"), {
        ownerName,
        type,
        breed,
        ageMonths: age,
        weightKg: weight,
        antibioticUsed,
        antibioticName: antibioticUsed ? antibioticName : "",
        lastDoseDate: antibioticUsed ? lastDoseDate : "",
        withdrawalDays: withdrawal,
        amuScore,
        amuLevel,
        mrlStatus,
        healthStatus,
        vaccinationStatus,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setOwnerName("");
      setType("");
      setBreed("");
      setAgeMonths("");
      setWeightKg("");
      setAntibioticUsed(false);
      setAntibioticName("");
      setLastDoseDate("");
      setWithdrawalDays("");
      setHealthStatus("Good");
      setVaccinationStatus(true);
      setOpen(false);

      alert("Animal added successfully!");
    } catch (error) {
      console.error("Error adding animal:", error);
      alert("Failed to add animal. Please try again.");
    }
  };

  /* =====================
     DELETE ANIMAL
  ===================== */
  const handleDelete = async (id: string) => {
    if (!user) return;
    
    if (confirm("Are you sure you want to delete this animal?")) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "livestock", id));
        setDetailOpen(false);
        setSelectedAnimal(null);
        alert("Animal deleted successfully!");
      } catch (error) {
        console.error("Error deleting animal:", error);
        alert("Failed to delete animal.");
      }
    }
  };

  /* =====================
     FILTERING
  ===================== */
  const filtered = livestock.filter((a) => {
    const matchesSearch =
      a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase()) ||
      a.breed.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "compliant" && a.mrlStatus === "COMPLIANT") ||
      (filterStatus === "non-compliant" && a.mrlStatus === "NOT COMPLIANT") ||
      (filterStatus === "high-risk" &&
        (a.amuLevel === "HIGH" || a.amuLevel === "CRITICAL"));

    return matchesSearch && matchesFilter;
  });

  /* =====================
     STATS
  ===================== */
  const stats = {
    total: livestock.length,
    compliant: livestock.filter((a) => a.mrlStatus === "COMPLIANT").length,
    highRisk: livestock.filter(
      (a) => a.amuLevel === "HIGH" || a.amuLevel === "CRITICAL"
    ).length,
  };

  /* =====================
     UI
  ===================== */
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Livestock Management</h1>
          <p className="text-gray-600 mt-1">
            ML-powered AMU risk assessment & MRL compliance tracking
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-5 w-5" />
              Add Livestock
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Animal</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Owner Name *</Label>
                <Input
                  placeholder="Enter owner name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Animal Type *</Label>
                  <Select onValueChange={setType} value={type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cow">Cow</SelectItem>
                      <SelectItem value="Goat">Goat</SelectItem>
                      <SelectItem value="Pig">Pig</SelectItem>
                      <SelectItem value="Sheep">Sheep</SelectItem>
                      <SelectItem value="Chicken">Chicken</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Breed *</Label>
                  <Input
                    placeholder="Enter breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age (months) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Weight (kg) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Health Status</Label>
                  <Select onValueChange={setHealthStatus} value={healthStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Vaccination Status</Label>
                  <Select
                    onValueChange={(v) => setVaccinationStatus(v === "yes")}
                    value={vaccinationStatus ? "yes" : "no"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Up to Date</SelectItem>
                      <SelectItem value="no">Not Vaccinated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Antibiotics Used?</Label>
                <Select
                  onValueChange={(v) => setAntibioticUsed(v === "yes")}
                  value={antibioticUsed ? "yes" : "no"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {antibioticUsed && (
                <>
                  <div>
                    <Label>Antibiotic Name</Label>
                    <Input
                      placeholder="e.g., Penicillin"
                      value={antibioticName}
                      onChange={(e) => setAntibioticName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Last Dose Date</Label>
                      <Input
                        type="date"
                        value={lastDoseDate}
                        onChange={(e) => setLastDoseDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Withdrawal Period (days)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 14"
                        value={withdrawalDays}
                        onChange={(e) => setWithdrawalDays(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button className="w-full" onClick={handleSave} size="lg">
                Save Animal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Animals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">
              {stats.compliant}
            </div>
            <div className="text-sm text-gray-600">MRL Compliant</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">
              {stats.highRisk}
            </div>
            <div className="text-sm text-gray-600">High AMU Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search by owner, type, or breed..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Select onValueChange={setFilterStatus} value={filterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Animals</SelectItem>
            <SelectItem value="compliant">MRL Compliant</SelectItem>
            <SelectItem value="non-compliant">Non-Compliant</SelectItem>
            <SelectItem value="high-risk">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* LIVESTOCK GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((animal) => (
          <Card key={animal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {animal.type} - {animal.breed}
                  </CardTitle>
                  <CardDescription>Owner: {animal.ownerName}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedAnimal(animal);
                    setDetailOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Age:</strong> {animal.ageMonths} months
                </div>
                <div>
                  <strong>Weight:</strong> {animal.weightKg} kg
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={
                    animal.amuLevel === "LOW"
                      ? "secondary"
                      : animal.amuLevel === "MODERATE"
                      ? "default"
                      : "destructive"
                  }
                >
                  {animal.amuLevel} AMU
                </Badge>
                <Badge
                  variant={
                    animal.mrlStatus === "COMPLIANT"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {animal.mrlStatus}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      animal.amuScore < 25
                        ? "bg-green-500"
                        : animal.amuScore < 50
                        ? "bg-yellow-500"
                        : animal.amuScore < 75
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${animal.amuScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{animal.amuScore}</span>
              </div>

              <div className="pt-2 border-t">
                <QRCode
                  size={128}
                  value={JSON.stringify({
                    id: animal.id,
                    owner: animal.ownerName,
                    type: animal.type,
                    breed: animal.breed,
                    amu: animal.amuLevel,
                    amuScore: animal.amuScore,
                    mrl: animal.mrlStatus,
                    scannedAt: new Date().toISOString(),
                  })}
                  className="mx-auto"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            No animals found. Add your first livestock to get started!
          </p>
        </Card>
      )}

      {/* DETAIL MODAL */}
      {selectedAnimal && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Animal Details</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="health">Health & AMU</TabsTrigger>
                <TabsTrigger value="qr">QR Code</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Owner</Label>
                    <p className="font-medium">{selectedAnimal.ownerName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Type</Label>
                    <p className="font-medium">{selectedAnimal.type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Breed</Label>
                    <p className="font-medium">{selectedAnimal.breed}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Age</Label>
                    <p className="font-medium">
                      {selectedAnimal.ageMonths} months
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Weight</Label>
                    <p className="font-medium">{selectedAnimal.weightKg} kg</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Health Status</Label>
                    <p className="font-medium">
                      {selectedAnimal.healthStatus}
                    </p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedAnimal.id)}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Animal
                </Button>
              </TabsContent>

              <TabsContent value="health" className="space-y-4">
                <Alert
                  className={
                    selectedAnimal.mrlStatus === "COMPLIANT"
                      ? "border-green-500"
                      : "border-red-500"
                  }
                >
                  {selectedAnimal.mrlStatus === "COMPLIANT" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <strong>MRL Status: {selectedAnimal.mrlStatus}</strong>
                    {selectedAnimal.mrlStatus === "NOT COMPLIANT" && (
                      <p className="mt-1 text-sm">
                        This animal is still within the withdrawal period. Not
                        safe for slaughter.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-600">AMU Risk Score</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            selectedAnimal.amuScore < 25
                              ? "bg-green-500"
                              : selectedAnimal.amuScore < 50
                              ? "bg-yellow-500"
                              : selectedAnimal.amuScore < 75
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${selectedAnimal.amuScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-lg">
                        {selectedAnimal.amuScore}/100
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Risk Level: {selectedAnimal.amuLevel}
                    </p>
                  </div>

                  {selectedAnimal.antibioticUsed && (
                    <>
                      <div>
                        <Label className="text-gray-600">Antibiotic Used</Label>
                        <p className="font-medium">
                          {selectedAnimal.antibioticName || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Last Dose Date</Label>
                        <p className="font-medium">
                          {selectedAnimal.lastDoseDate || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">
                          Withdrawal Period
                        </Label>
                        <p className="font-medium">
                          {selectedAnimal.withdrawalDays} days
                        </p>
                      </div>
                    </>
                  )}

                  <div>
                    <Label className="text-gray-600">Vaccination Status</Label>
                    <p className="font-medium">
                      {selectedAnimal.vaccinationStatus
                        ? "Up to Date"
                        : "Not Vaccinated"}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="qr"
                className="flex flex-col items-center space-y-4"
              >
                <QRCode
                  size={300}
                  value={JSON.stringify({
                    id: selectedAnimal.id,
                    owner: selectedAnimal.ownerName,
                    type: selectedAnimal.type,
                    breed: selectedAnimal.breed,
                    amu: selectedAnimal.amuLevel,
                    amuScore: selectedAnimal.amuScore,
                    mrl: selectedAnimal.mrlStatus,
                    scannedAt: new Date().toISOString(),
                  })}
                />
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code for instant livestock information
                </p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
