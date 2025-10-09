import AdminLayout from "@/admin/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Users, Recycle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const donationData = [
  { month: "May", cupFoundation: 4000, projectUnforgotten: 3000 },
  { month: "Jun", cupFoundation: 3000, projectUnforgotten: 4500 },
  { month: "Jul", cupFoundation: 5000, projectUnforgotten: 3800 },
  { month: "Aug", cupFoundation: 4500, projectUnforgotten: 4200 },
  { month: "Sep", cupFoundation: 6000, projectUnforgotten: 5000 },
  { month: "Oct", cupFoundation: 5500, projectUnforgotten: 4800 },
];

const impactData = [
  { name: "Cup Foundation", value: 55 },
  { name: "Project Unforgotten", value: 45 },
];

const COLORS = ["#FF8C42", "#00B3B8"];

export default function CSRReports() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">CSR Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track the impact of Cup Foundation and Project Unforgotten
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Total Donations
                  </p>
                  <h3 className="text-3xl font-heading font-bold mt-2">
                    GH₵ 27,800
                  </h3>
                  <p className="text-sm text-fresh-lime mt-2">+15% this month</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-mango-orange">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Communities Reached
                  </p>
                  <h3 className="text-3xl font-heading font-bold mt-2">32</h3>
                  <p className="text-sm text-fresh-lime mt-2">+8 new</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-ocean-teal">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Bottles Recycled
                  </p>
                  <h3 className="text-3xl font-heading font-bold mt-2">12,450</h3>
                  <p className="text-sm text-fresh-lime mt-2">+1,200 this week</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-fresh-lime">
                  <Recycle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Impact Score
                  </p>
                  <h3 className="text-3xl font-heading font-bold mt-2">8.7/10</h3>
                  <p className="text-sm text-fresh-lime mt-2">Excellent</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-tropical-pink">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cup Foundation Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Education Support</span>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Progress value={75} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Health Initiatives</span>
                  <span className="text-sm text-muted-foreground">60%</span>
                </div>
                <Progress value={60} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Clean Water Projects</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Unforgotten Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Elder Care Support</span>
                  <span className="text-sm text-muted-foreground">80%</span>
                </div>
                <Progress value={80} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Community Centers</span>
                  <span className="text-sm text-muted-foreground">55%</span>
                </div>
                <Progress value={55} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Healthcare Access</span>
                  <span className="text-sm text-muted-foreground">70%</span>
                </div>
                <Progress value={70} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Donation Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={donationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="cupFoundation" name="Cup Foundation" fill="#FF8C42" />
                  <Bar dataKey="projectUnforgotten" name="Project Unforgotten" fill="#00B3B8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impact Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={impactData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {impactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
