import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";
import { signInUser, signUpUser } from "@/api/authApi";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("signin-email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("signin-password") as HTMLInputElement).value;

    try {
      const data = await signInUser({ email, password });
      login({
        id: data.user?.id || "",
        username: data.user?.username || "",
        email: data.user?.email || "",
        isAdmin: data.role === "admin",
        role: data.role,
        token: data.token,
        refreshToken: data.refreshToken,
      });
      toast.success("Welcome back!");
      navigate("/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("signup-name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("signup-email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("signup-password") as HTMLInputElement).value;
    const company = (form.elements.namedItem("signup-company") as HTMLInputElement)?.value || "";

    try {
      const data = await signUpUser({ fullName, email, password, company });
      login({
        id: data.user?.id || "",
        username: data.user?.username || "",
        email: data.user?.email || "",
        isAdmin: data.role === "admin",
        role: data.role,
        token: data.token,
        refreshToken: data.refreshToken,
      });
      toast.success("Account created successfully!");
      navigate("/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col"
    >
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border-2 border-border rounded-2xl shadow-xl p-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="font-semibold">LOG IN</TabsTrigger>
                <TabsTrigger value="signup" className="font-semibold">SIGN UP</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" name="signin-email" type="email" required />
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" name="signin-password" type={showSignInPassword ? "text" : "password"} required />
                    <button type="button" onClick={() => setShowSignInPassword(!showSignInPassword)} className="absolute right-3 top-9 text-muted-foreground hover:text-foreground">
                      {showSignInPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" name="signup-name" type="text" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="signup-email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-company">Company (Optional)</Label>
                    <Input id="signup-company" name="signup-company" type="text" />
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" name="signup-password" type={showSignUpPassword ? "text" : "password"} required />
                    <button type="button" onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="absolute right-3 top-9 text-muted-foreground hover:text-foreground">
                      {showSignUpPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Creating account..." : "Create Account"}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
