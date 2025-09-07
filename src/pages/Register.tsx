import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: "",
    countryCode: "+221",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.phoneNumber || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    // Validation nom d'utilisateur
    if (formData.username.length < 3) {
      toast({
        title: "Erreur",
        description: "Le nom d'utilisateur doit contenir au moins 3 caractères",
        variant: "destructive"
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast({
        title: "Erreur",
        description: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscore",
        variant: "destructive"
      });
      return;
    }

    // Validation numéro de téléphone
    if (formData.phoneNumber.length < 8 || formData.phoneNumber.length > 15) {
      toast({
        title: "Erreur",
        description: "Le numéro de téléphone doit contenir entre 8 et 15 chiffres",
        variant: "destructive"
      });
      return;
    }

    if (!/^\d+$/.test(formData.phoneNumber)) {
      toast({
        title: "Erreur",
        description: "Le numéro de téléphone ne peut contenir que des chiffres",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erreur", 
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }

    const fullPhoneNumber = formData.countryCode + formData.phoneNumber;
    const success = await register(formData.username, fullPhoneNumber, formData.password);
    
    if (success) {
      toast({
        title: "Compte créé !",
        description: "Bienvenue sur KaaySamp"
      });
      navigate("/");
    } else {
      toast({
        title: "Erreur d'inscription",
        description: "Un compte avec ce numéro ou nom d'utilisateur existe déjà",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/src/assets/kaaysamp-logo.jpg" 
              alt="KaaySamp" 
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            Créer un compte
          </CardTitle>
          <CardDescription>
            Rejoignez la communauté KaaySamp
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                placeholder="votreusername"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="flex space-x-2">
                <select 
                  className="flex h-10 w-20 rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.countryCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                  disabled={isLoading}
                >
                  <option value="+93">+93</option>
                  <option value="+355">+355</option>
                  <option value="+213">+213</option>
                  <option value="+376">+376</option>
                  <option value="+244">+244</option>
                  <option value="+54">+54</option>
                  <option value="+374">+374</option>
                  <option value="+61">+61</option>
                  <option value="+43">+43</option>
                  <option value="+994">+994</option>
                  <option value="+973">+973</option>
                  <option value="+880">+880</option>
                  <option value="+375">+375</option>
                  <option value="+32">+32</option>
                  <option value="+501">+501</option>
                  <option value="+229">+229</option>
                  <option value="+591">+591</option>
                  <option value="+55">+55</option>
                  <option value="+673">+673</option>
                  <option value="+359">+359</option>
                  <option value="+226">+226</option>
                  <option value="+257">+257</option>
                  <option value="+855">+855</option>
                  <option value="+237">+237</option>
                  <option value="+1">+1</option>
                  <option value="+238">+238</option>
                  <option value="+56">+56</option>
                  <option value="+86">+86</option>
                  <option value="+57">+57</option>
                  <option value="+269">+269</option>
                  <option value="+242">+242</option>
                  <option value="+243">+243</option>
                  <option value="+506">+506</option>
                  <option value="+225">+225</option>
                  <option value="+385">+385</option>
                  <option value="+53">+53</option>
                  <option value="+357">+357</option>
                  <option value="+420">+420</option>
                  <option value="+45">+45</option>
                  <option value="+253">+253</option>
                  <option value="+593">+593</option>
                  <option value="+20">+20</option>
                  <option value="+503">+503</option>
                  <option value="+240">+240</option>
                  <option value="+291">+291</option>
                  <option value="+372">+372</option>
                  <option value="+251">+251</option>
                  <option value="+358">+358</option>
                  <option value="+33">+33</option>
                  <option value="+241">+241</option>
                  <option value="+220">+220</option>
                  <option value="+995">+995</option>
                  <option value="+49">+49</option>
                  <option value="+233">+233</option>
                  <option value="+30">+30</option>
                  <option value="+502">+502</option>
                  <option value="+224">+224</option>
                  <option value="+245">+245</option>
                  <option value="+509">+509</option>
                  <option value="+504">+504</option>
                  <option value="+36">+36</option>
                  <option value="+354">+354</option>
                  <option value="+91">+91</option>
                  <option value="+62">+62</option>
                  <option value="+98">+98</option>
                  <option value="+964">+964</option>
                  <option value="+353">+353</option>
                  <option value="+972">+972</option>
                  <option value="+39">+39</option>
                  <option value="+81">+81</option>
                  <option value="+962">+962</option>
                  <option value="+7">+7</option>
                  <option value="+254">+254</option>
                  <option value="+965">+965</option>
                  <option value="+996">+996</option>
                  <option value="+371">+371</option>
                  <option value="+961">+961</option>
                  <option value="+266">+266</option>
                  <option value="+231">+231</option>
                  <option value="+218">+218</option>
                  <option value="+370">+370</option>
                  <option value="+352">+352</option>
                  <option value="+261">+261</option>
                  <option value="+265">+265</option>
                  <option value="+60">+60</option>
                  <option value="+223">+223</option>
                  <option value="+356">+356</option>
                  <option value="+222">+222</option>
                  <option value="+230">+230</option>
                  <option value="+52">+52</option>
                  <option value="+373">+373</option>
                  <option value="+377">+377</option>
                  <option value="+976">+976</option>
                  <option value="+212">+212</option>
                  <option value="+258">+258</option>
                  <option value="+264">+264</option>
                  <option value="+977">+977</option>
                  <option value="+31">+31</option>
                  <option value="+64">+64</option>
                  <option value="+505">+505</option>
                  <option value="+227">+227</option>
                  <option value="+234">+234</option>
                  <option value="+47">+47</option>
                  <option value="+968">+968</option>
                  <option value="+92">+92</option>
                  <option value="+507">+507</option>
                  <option value="+595">+595</option>
                  <option value="+51">+51</option>
                  <option value="+63">+63</option>
                  <option value="+48">+48</option>
                  <option value="+351">+351</option>
                  <option value="+974">+974</option>
                  <option value="+40">+40</option>
                  <option value="+250">+250</option>
                  <option value="+966">+966</option>
                  <option value="+221">+221</option>
                  <option value="+381">+381</option>
                  <option value="+65">+65</option>
                  <option value="+421">+421</option>
                  <option value="+386">+386</option>
                  <option value="+27">+27</option>
                  <option value="+82">+82</option>
                  <option value="+34">+34</option>
                  <option value="+94">+94</option>
                  <option value="+46">+46</option>
                  <option value="+41">+41</option>
                  <option value="+963">+963</option>
                  <option value="+886">+886</option>
                  <option value="+255">+255</option>
                  <option value="+66">+66</option>
                  <option value="+228">+228</option>
                  <option value="+216">+216</option>
                  <option value="+90">+90</option>
                  <option value="+256">+256</option>
                  <option value="+380">+380</option>
                  <option value="+971">+971</option>
                  <option value="+44">+44</option>
                  <option value="+598">+598</option>
                  <option value="+58">+58</option>
                  <option value="+84">+84</option>
                  <option value="+967">+967</option>
                  <option value="+260">+260</option>
                  <option value="+263">+263</option>
                </select>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="77 123 45 67"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/[^0-9]/g, '') }))}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}