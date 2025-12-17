import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

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
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Calendar, QrCode } from "lucide-react";

import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

/* =======================
   Types
======================= */
interface Livestock {
  id: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  health: string;
  mrlStatus: string;
  amuUsage: string;
  lastCheck: string;
  location: string;
}

/* =======================
   Component
======================= */
const Livestock = () => {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [livestockData, setLivestockData] = useState<Livestock[]>([]);

  /* Form State */
  const [type, setType] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");

  /* =======================
     Algorithms (UNCHANGED)
  ======================= */
  const calculateHealth = (age: number, weight: number) => {
    if (age > 8 || weight < 30) return "monitoring";
    return "healthy";
  };

  const calculateMRL = (amu: string) => {
    if (amu === "high") return "warning";
    return "compliant";
  };

  const calculateAMU = (age: number) => {
    if (age < 2) return "moderate";
    return "low";
  };

  /* =======================
     Fetch Livestock
  ======================= */
  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "livestock");

    const unsub = onSnapshot(ref, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => {
          const d = doc.data();
          if (!d.type || !d.breed) return null;

          return {
            id: doc.id,
            type: d.type,
            breed: d.breed,
            age: Number(d.age),
            weight: Number(d.weight),
            health: d.health,
            amuUsage: d.amuUsage,
            mrlStatus: d.mrlStatus,
            lastCheck: d.lastCheck,
            location: d.location,
          };
        })
        .filter(Boolean) as Livestock[];

      setLivestockData(data);
    });

    return () => unsub();
  }, [user]);

  /* =======================
     Add Livestock
  ======================= */
  const handleAddAnimal = async () => {
    if (!user || !type || !breed || !age || !weight) return;

    const ageNum = Number(age);
    const weightNum = Number(weight);

    const amu = calculateAMU(ageNum);
    const health = calculateHealth(ageNum, weightNum);
    const mrl = calculateMRL(amu);

    await addDoc(collection(db, "users", user.uid, "livestock"), {
      type,
      breed,
      age: ageNum,
      weight: weightNum,
      location: "Farm Area",
      health,
      amuUsage: amu,
      mrlStatus: mrl,
      lastCheck: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    });

    setType("");
    setBreed("");
    setAge("");
    setWeight("");
  };

  const filteredLivestock = livestockData.filter(
    (animal) =>
      animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadge = (value: string) => (
    <Badge variant={value === "warning" ? "destructive" : "secondary"}>
      {value}
    </Badge>
  );

  /* =======================
     JSX
  ======================= */
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Livestock Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your livestock with QR tracking
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Livestock
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Livestock</DialogTitle>
              <DialogDescription>
                Register a new animal
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Label>Type</Label>
              <Select onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pig">Pig</SelectItem>
                  <SelectItem value="Sheep">Sheep</SelectItem>
                  <SelectItem value="Cattle">Cattle</SelectItem>
                  <SelectItem value="Goat">Goat</SelectItem>
                </SelectContent>
              </Select>

              <Input placeholder="Breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
              <Input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
              <Input type="number" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>

            <Button onClick={handleAddAnimal}>Add</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search livestock..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredLivestock.map((animal) => (
          <Card key={animal.id}>
            <CardHeader>
              <CardTitle>{animal.type}</CardTitle>
              <CardDescription>{animal.breed}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <p>Age: {animal.age}</p>
              <p>Weight: {animal.weight}</p>

              <div className="flex gap-2">
                {getBadge(animal.health)}
                {getBadge(animal.mrlStatus)}
                {getBadge(animal.amuUsage)}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {animal.lastCheck}
              </div>

              {/* 🔥 QR CODE */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    View QR
                  </Button>
                </DialogTrigger>

                <DialogContent className="flex flex-col items-center">
                  <DialogTitle>Livestock QR Code</DialogTitle>

                  <QRCode
                    value={JSON.stringify({
                      livestockId: animal.id,
                      owner: user?.uid,
                      type: animal.type,
                      breed: animal.breed,
                    })}
                    size={180}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Livestock;
