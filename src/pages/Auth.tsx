import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";
import { signInUser, signUpUser } from "@/api/authApi";

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("signin-email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("signin-password") as HTMLInputElement).value;

    try {
      const user = await signInUser({ email, password });
      login(user);
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
      const user = await signUpUser({ fullName, email, password, company });
      login(user);
      toast.success("Account created successfully!");
      navigate("/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border-2 border-border rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h1 className="font-heading font-bold text-3xl"></h1>
              
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <p className="text-muted-foreground mx-auto text-center">Log in to manage your orders </p>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" name="signin-email" type="email" placeholder="" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" name="signin-password" type="password" placeholder="" required />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                    </div>
                    <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <p className="text-muted-foreground mx-auto text-center">Sign up to make your orders </p>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" name="signup-name" type="text" placeholder="" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="signup-email" type="email" placeholder="" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-company">Company (Optional)</Label>
                    <Input id="signup-company" name="signup-company" type="text" placeholder="" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" name="signup-password" type="password" placeholder="••••••••" required />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
 
    </div>
  );
}
