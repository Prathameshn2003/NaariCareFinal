import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, MapPin, Phone, Mail, Globe, Building2 } from "lucide-react";

interface NGO {
  id: string;
  name: string;
  description: string | null;
  focus_area: string | null;
  location: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  image_url: string | null;
}

const NGOs = () => {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [filteredNgos, setFilteredNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchNGOs = async () => {
      const { data, error } = await supabase
        .from('ngos')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setNgos(data);
        setFilteredNgos(data);
      }
      setLoading(false);
    };

    fetchNGOs();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredNgos(
        ngos.filter(n =>
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.focus_area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.location?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredNgos(ngos);
    }
  }, [searchQuery, ngos]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                NGOs & Support Organizations
              </h1>
            </div>
            <p className="text-muted-foreground">
              Find organizations dedicated to women's health and support
            </p>
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, focus area, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filteredNgos.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">
                {ngos.length === 0 ? "No NGOs available at the moment." : "No NGOs match your search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNgos.map((ngo) => (
                <div key={ngo.id} className="glass-card rounded-xl p-6 hover:shadow-glow transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      {ngo.image_url ? (
                        <img 
                          src={ngo.image_url} 
                          alt={ngo.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-accent" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{ngo.name}</h3>
                      {ngo.focus_area && (
                        <span className="inline-block px-2 py-1 mt-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                          {ngo.focus_area}
                        </span>
                      )}
                    </div>
                  </div>

                  {ngo.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {ngo.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {ngo.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{ngo.location}</span>
                      </div>
                    )}
                    {ngo.contact_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${ngo.contact_phone}`} className="hover:text-foreground">{ngo.contact_phone}</a>
                      </div>
                    )}
                    {ngo.contact_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${ngo.contact_email}`} className="hover:text-foreground">{ngo.contact_email}</a>
                      </div>
                    )}
                  </div>

                  {ngo.website && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                        <a href={ngo.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4" />
                          Visit Website
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NGOs;
