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
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.countryCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                  disabled={isLoading}
                >
                  <option value="+93">🇦🇫 +93 Afghanistan</option>
                  <option value="+355">🇦🇱 +355 Albanie</option>
                  <option value="+213">🇩🇿 +213 Algérie</option>
                  <option value="+376">🇦🇩 +376 Andorre</option>
                  <option value="+244">🇦🇴 +244 Angola</option>
                  <option value="+54">🇦🇷 +54 Argentine</option>
                  <option value="+374">🇦🇲 +374 Arménie</option>
                  <option value="+61">🇦🇺 +61 Australie</option>
                  <option value="+43">🇦🇹 +43 Autriche</option>
                  <option value="+994">🇦🇿 +994 Azerbaïdjan</option>
                  <option value="+973">🇧🇭 +973 Bahreïn</option>
                  <option value="+880">🇧🇩 +880 Bangladesh</option>
                  <option value="+375">🇧🇾 +375 Biélorussie</option>
                  <option value="+32">🇧🇪 +32 Belgique</option>
                  <option value="+501">🇧🇿 +501 Belize</option>
                  <option value="+229">🇧🇯 +229 Bénin</option>
                  <option value="+591">🇧🇴 +591 Bolivie</option>
                  <option value="+55">🇧🇷 +55 Brésil</option>
                  <option value="+673">🇧🇳 +673 Brunei</option>
                  <option value="+359">🇧🇬 +359 Bulgarie</option>
                  <option value="+226">🇧🇫 +226 Burkina Faso</option>
                  <option value="+257">🇧🇮 +257 Burundi</option>
                  <option value="+855">🇰🇭 +855 Cambodge</option>
                  <option value="+237">🇨🇲 +237 Cameroun</option>
                  <option value="+1">🇨🇦 +1 Canada</option>
                  <option value="+238">🇨🇻 +238 Cap-Vert</option>
                  <option value="+56">🇨🇱 +56 Chili</option>
                  <option value="+86">🇨🇳 +86 Chine</option>
                  <option value="+57">🇨🇴 +57 Colombie</option>
                  <option value="+269">🇰🇲 +269 Comores</option>
                  <option value="+242">🇨🇬 +242 Congo</option>
                  <option value="+243">🇨🇩 +243 RD Congo</option>
                  <option value="+506">🇨🇷 +506 Costa Rica</option>
                  <option value="+225">🇨🇮 +225 Côte d'Ivoire</option>
                  <option value="+385">🇭🇷 +385 Croatie</option>
                  <option value="+53">🇨🇺 +53 Cuba</option>
                  <option value="+357">🇨🇾 +357 Chypre</option>
                  <option value="+420">🇨🇿 +420 République tchèque</option>
                  <option value="+45">🇩🇰 +45 Danemark</option>
                  <option value="+253">🇩🇯 +253 Djibouti</option>
                  <option value="+593">🇪🇨 +593 Équateur</option>
                  <option value="+20">🇪🇬 +20 Égypte</option>
                  <option value="+503">🇸🇻 +503 El Salvador</option>
                  <option value="+240">🇬🇶 +240 Guinée équatoriale</option>
                  <option value="+291">🇪🇷 +291 Érythrée</option>
                  <option value="+372">🇪🇪 +372 Estonie</option>
                  <option value="+251">🇪🇹 +251 Éthiopie</option>
                  <option value="+358">🇫🇮 +358 Finlande</option>
                  <option value="+33">🇫🇷 +33 France</option>
                  <option value="+241">🇬🇦 +241 Gabon</option>
                  <option value="+220">🇬🇲 +220 Gambie</option>
                  <option value="+995">🇬🇪 +995 Géorgie</option>
                  <option value="+49">🇩🇪 +49 Allemagne</option>
                  <option value="+233">🇬🇭 +233 Ghana</option>
                  <option value="+30">🇬🇷 +30 Grèce</option>
                  <option value="+502">🇬🇹 +502 Guatemala</option>
                  <option value="+224">🇬🇳 +224 Guinée</option>
                  <option value="+245">🇬🇼 +245 Guinée-Bissau</option>
                  <option value="+509">🇭🇹 +509 Haïti</option>
                  <option value="+504">🇭🇳 +504 Honduras</option>
                  <option value="+36">🇭🇺 +36 Hongrie</option>
                  <option value="+354">🇮🇸 +354 Islande</option>
                  <option value="+91">🇮🇳 +91 Inde</option>
                  <option value="+62">🇮🇩 +62 Indonésie</option>
                  <option value="+98">🇮🇷 +98 Iran</option>
                  <option value="+964">🇮🇶 +964 Irak</option>
                  <option value="+353">🇮🇪 +353 Irlande</option>
                  <option value="+972">🇮🇱 +972 Israël</option>
                  <option value="+39">🇮🇹 +39 Italie</option>
                  <option value="+81">🇯🇵 +81 Japon</option>
                  <option value="+962">🇯🇴 +962 Jordanie</option>
                  <option value="+7">🇰🇿 +7 Kazakhstan</option>
                  <option value="+254">🇰🇪 +254 Kenya</option>
                  <option value="+965">🇰🇼 +965 Koweït</option>
                  <option value="+996">🇰🇬 +996 Kirghizistan</option>
                  <option value="+371">🇱🇻 +371 Lettonie</option>
                  <option value="+961">🇱🇧 +961 Liban</option>
                  <option value="+266">🇱🇸 +266 Lesotho</option>
                  <option value="+231">🇱🇷 +231 Liberia</option>
                  <option value="+218">🇱🇾 +218 Libye</option>
                  <option value="+370">🇱🇹 +370 Lituanie</option>
                  <option value="+352">🇱🇺 +352 Luxembourg</option>
                  <option value="+261">🇲🇬 +261 Madagascar</option>
                  <option value="+265">🇲🇼 +265 Malawi</option>
                  <option value="+60">🇲🇾 +60 Malaisie</option>
                  <option value="+223">🇲🇱 +223 Mali</option>
                  <option value="+356">🇲🇹 +356 Malte</option>
                  <option value="+222">🇲🇷 +222 Mauritanie</option>
                  <option value="+230">🇲🇺 +230 Maurice</option>
                  <option value="+52">🇲🇽 +52 Mexique</option>
                  <option value="+373">🇲🇩 +373 Moldavie</option>
                  <option value="+377">🇲🇨 +377 Monaco</option>
                  <option value="+976">🇲🇳 +976 Mongolie</option>
                  <option value="+212">🇲🇦 +212 Maroc</option>
                  <option value="+258">🇲🇿 +258 Mozambique</option>
                  <option value="+264">🇳🇦 +264 Namibie</option>
                  <option value="+977">🇳🇵 +977 Népal</option>
                  <option value="+31">🇳🇱 +31 Pays-Bas</option>
                  <option value="+64">🇳🇿 +64 Nouvelle-Zélande</option>
                  <option value="+505">🇳🇮 +505 Nicaragua</option>
                  <option value="+227">🇳🇪 +227 Niger</option>
                  <option value="+234">🇳🇬 +234 Nigeria</option>
                  <option value="+47">🇳🇴 +47 Norvège</option>
                  <option value="+968">🇴🇲 +968 Oman</option>
                  <option value="+92">🇵🇰 +92 Pakistan</option>
                  <option value="+507">🇵🇦 +507 Panama</option>
                  <option value="+595">🇵🇾 +595 Paraguay</option>
                  <option value="+51">🇵🇪 +51 Pérou</option>
                  <option value="+63">🇵🇭 +63 Philippines</option>
                  <option value="+48">🇵🇱 +48 Pologne</option>
                  <option value="+351">🇵🇹 +351 Portugal</option>
                  <option value="+974">🇶🇦 +974 Qatar</option>
                  <option value="+40">🇷🇴 +40 Roumanie</option>
                  <option value="+7">🇷🇺 +7 Russie</option>
                  <option value="+250">🇷🇼 +250 Rwanda</option>
                  <option value="+966">🇸🇦 +966 Arabie saoudite</option>
                  <option value="+221">🇸🇳 +221 Sénégal</option>
                  <option value="+381">🇷🇸 +381 Serbie</option>
                  <option value="+65">🇸🇬 +65 Singapour</option>
                  <option value="+421">🇸🇰 +421 Slovaquie</option>
                  <option value="+386">🇸🇮 +386 Slovénie</option>
                  <option value="+27">🇿🇦 +27 Afrique du Sud</option>
                  <option value="+82">🇰🇷 +82 Corée du Sud</option>
                  <option value="+34">🇪🇸 +34 Espagne</option>
                  <option value="+94">🇱🇰 +94 Sri Lanka</option>
                  <option value="+46">🇸🇪 +46 Suède</option>
                  <option value="+41">🇨🇭 +41 Suisse</option>
                  <option value="+963">🇸🇾 +963 Syrie</option>
                  <option value="+886">🇹🇼 +886 Taïwan</option>
                  <option value="+255">🇹🇿 +255 Tanzanie</option>
                  <option value="+66">🇹🇭 +66 Thaïlande</option>
                  <option value="+228">🇹🇬 +228 Togo</option>
                  <option value="+216">🇹🇳 +216 Tunisie</option>
                  <option value="+90">🇹🇷 +90 Turquie</option>
                  <option value="+256">🇺🇬 +256 Ouganda</option>
                  <option value="+380">🇺🇦 +380 Ukraine</option>
                  <option value="+971">🇦🇪 +971 Émirats arabes unis</option>
                  <option value="+44">🇬🇧 +44 Royaume-Uni</option>
                  <option value="+1">🇺🇸 +1 États-Unis</option>
                  <option value="+598">🇺🇾 +598 Uruguay</option>
                  <option value="+58">🇻🇪 +58 Venezuela</option>
                  <option value="+84">🇻🇳 +84 Vietnam</option>
                  <option value="+967">🇾🇪 +967 Yémen</option>
                  <option value="+260">🇿🇲 +260 Zambie</option>
                  <option value="+263">🇿🇼 +263 Zimbabwe</option>
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