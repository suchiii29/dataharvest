import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Plus,
  QrCode,
  FileText,
  Calendar,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const Livestock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  const livestockData = [
    {
      id: "COW-1247",
      type: "Cattle",
      breed: "Holstein",
      age: "3 years",
      weight: "650 kg",
      location: "Pasture A-1",
      health: "healthy",
      lastCheck: "2024-09-15",
      mrlStatus: "compliant",
      amuUsage: "low",
      qrCode: "QR-COW-1247",
    },
    {
      id: "PIG-0892",
      type: "Pig",
      breed: "Yorkshire",
      age: "18 months",
      weight: "180 kg",
      location: "Pen B-3",
      health: "monitoring",
      lastCheck: "2024-09-16",
      mrlStatus: "warning",
      amuUsage: "moderate",
      qrCode: "QR-PIG-0892",
    },
    {
      id: "SHEEP-0445",
      type: "Sheep",
      breed: "Merino",
      age: "2 years",
      weight: "75 kg",
      location: "Field C-2",
      health: "healthy",
      lastCheck: "2024-09-14",
      mrlStatus: "compliant",
      amuUsage: "none",
      qrCode: "QR-SHEEP-0445",
    },
    {
      id: "COW-1203",
      type: "Cattle",
      breed: "Angus",
      age: "4 years",
      weight: "720 kg",
      location: "Pasture A-2",
      health: "healthy",
      lastCheck: "2024-09-17",
      mrlStatus: "compliant",
      amuUsage: "low",
      qrCode: "QR-COW-1203",
    },
  ];

  const filteredLivestock = livestockData.filter(animal =>
    animal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "compliant":
        return "secondary";
      case "monitoring":
      case "warning":
        return "secondary";
      case "alert":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getAmuColor = (usage: string) => {
    switch (usage) {
      case "none":
        return "secondary";
      case "low":
        return "outline";
      case "moderate":
        return "secondary";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Livestock Management</h1>
          <p className="text-muted-foreground">Monitor and manage your livestock with QR tracking</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Livestock
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Livestock</DialogTitle>
              <DialogDescription>
                Register a new animal in your farm management system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="animal-type" className="text-right">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select animal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="pig">Pig</SelectItem>
                    <SelectItem value="sheep">Sheep</SelectItem>
                    <SelectItem value="goat">Goat</SelectItem>
                    <SelectItem value="poultry">Poultry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="breed" className="text-right">
                  Breed
                </Label>
                <Input id="breed" className="col-span-3" placeholder="Enter breed" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="age" className="text-right">
                  Age
                </Label>
                <Input id="age" className="col-span-3" placeholder="Enter age" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weight" className="text-right">
                  Weight
                </Label>
                <Input id="weight" className="col-span-3" placeholder="Enter weight" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-gradient-primary">Add Animal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Livestock Database</CardTitle>
              <CardDescription>Complete overview of all registered animals</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search livestock..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLivestock.map((animal) => (
              <Card key={animal.id} className="shadow-soft hover:shadow-medium transition-smooth cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{animal.id}</CardTitle>
                    <Badge variant={getStatusColor(animal.health)}>
                      {animal.health}
                    </Badge>
                  </div>
                  <CardDescription>{animal.type} • {animal.breed}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Age</p>
                      <p className="font-medium">{animal.age}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-medium">{animal.weight}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{animal.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">MRL:</span>
                      <Badge variant={getStatusColor(animal.mrlStatus)} className="text-xs">
                        {animal.mrlStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">AMU:</span>
                      <Badge variant={getAmuColor(animal.amuUsage)} className="text-xs">
                        {animal.amuUsage}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Last check: {animal.lastCheck}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">Health Status</TabsTrigger>
          <TabsTrigger value="mrl">MRL Monitoring</TabsTrigger>
          <TabsTrigger value="amu">AMU Tracking</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Health Status Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-secondary/10 rounded-lg">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">1,198</p>
                  <p className="text-sm text-muted-foreground">Healthy Animals</p>
                </div>
                <div className="text-center p-6 bg-secondary/10 rounded-lg">
                  <AlertCircle className="h-12 w-12 text-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-sm text-muted-foreground">Under Monitoring</p>
                </div>
                <div className="text-center p-6 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-sm text-muted-foreground">Require Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mrl">
          <Card>
            <CardHeader>
              <CardTitle>Maximum Residue Limits</CardTitle>
              <CardDescription>Track chemical residue levels across your livestock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <p>MRL monitoring dashboard</p>
                <p className="text-sm">Detailed residue tracking and compliance reporting</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amu">
          <Card>
            <CardHeader>
              <CardTitle>Antimicrobial Usage</CardTitle>
              <CardDescription>Monitor and manage antimicrobial treatments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-16 w-16 mx-auto mb-4" />
                <p>AMU tracking system</p>
                <p className="text-sm">Track treatments, dosages, and withdrawal periods</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Compliance Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full justify-start bg-gradient-primary">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate MRL Compliance Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Livestock Database
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  AMU Usage Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Livestock;