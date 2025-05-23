
import { useState } from "react";
import { Settings, CreditCard, CheckCircle2, PlusCircle, Trash2, Edit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type PaymentMethod = {
  id: string;
  type: "credit" | "debit";
  lastFour: string;
  cardBrand: string;
  expiryDate: string;
  isDefault: boolean;
};

const Configuracoes = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "credit",
      lastFour: "4242",
      cardBrand: "Visa",
      expiryDate: "12/25",
      isDefault: true
    }
  ]);

  const [newCard, setNewCard] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    type: "credit" as "credit" | "debit"
  });

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const handleAddCard = () => {
    // Basic validation
    if (!newCard.cardNumber || !newCard.cardName || !newCard.expiryDate || !newCard.cvv) {
      toast.error("Por favor, preencha todos os campos do cartão");
      return;
    }

    // Format validation (simple example)
    if (newCard.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error("Número de cartão inválido");
      return;
    }

    if (newCard.cvv.length < 3) {
      toast.error("CVV inválido");
      return;
    }

    // Add new card
    const lastFour = newCard.cardNumber.slice(-4);
    const cardBrand = getCardBrand(newCard.cardNumber);
    
    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: newCard.type,
      lastFour,
      cardBrand,
      expiryDate: newCard.expiryDate,
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setIsAddCardOpen(false);
    resetCardForm();
    toast.success("Cartão adicionado com sucesso");
  };

  const resetCardForm = () => {
    setNewCard({
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
      type: "credit"
    });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number with spaces after every 4 digits
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Add spaces for readability
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setNewCard({ ...newCard, cardNumber: formatted });
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    setNewCard({ ...newCard, expiryDate: value });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setNewCard({ ...newCard, cvv: value });
  };

  const getCardBrand = (cardNumber: string): string => {
    // Simplified card brand detection
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'Amex';
    return 'Desconhecido';
  };

  const setDefaultCard = (id: string) => {
    setPaymentMethods(paymentMethods.map(card => ({
      ...card,
      isDefault: card.id === id
    })));
    toast.success("Cartão padrão atualizado");
  };

  const deleteCard = (id: string) => {
    const updatedCards = paymentMethods.filter(card => card.id !== id);
    
    // If we're deleting the default card and there are other cards left, set a new default
    if (paymentMethods.find(card => card.id === id)?.isDefault && updatedCards.length > 0) {
      updatedCards[0].isDefault = true;
    }
    
    setPaymentMethods(updatedCards);
    toast.success("Cartão removido com sucesso");
  };

  return (
    <div className="flex flex-col items-start p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Configurações
      </h1>

      <Card className="w-full mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> 
                Métodos de Pagamento
              </CardTitle>
              <CardDescription>
                Gerencie seus cartões de crédito e débito para pagamentos.
              </CardDescription>
            </div>
            <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Cartão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                  <DialogDescription>
                    Insira os dados do seu cartão abaixo para adicionar um novo método de pagamento.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="0000 0000 0000 0000" 
                      value={newCard.cardNumber}
                      onChange={handleCardNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input 
                      id="cardName" 
                      placeholder="Nome como aparece no cartão"
                      value={newCard.cardName}
                      onChange={(e) => setNewCard({...newCard, cardName: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="expiryDate">Validade</Label>
                      <Input 
                        id="expiryDate" 
                        placeholder="MM/YY"
                        value={newCard.expiryDate}
                        onChange={handleExpiryDateChange}
                      />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        placeholder="123"
                        value={newCard.cvv}
                        onChange={handleCvvChange}
                      />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="cardType">Tipo</Label>
                      <select 
                        id="cardType"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={newCard.type}
                        onChange={(e) => setNewCard({...newCard, type: e.target.value as "credit" | "debit"})}
                      >
                        <option value="credit">Crédito</option>
                        <option value="debit">Débito</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
                  <AlertCircle className="h-3 w-3" />
                  Suas informações de cartão são processadas de forma segura.
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCardOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddCard}>Adicionar Cartão</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CreditCard className="w-12 h-12 mb-3 text-muted-foreground" />
              <p className="mb-2">Você ainda não adicionou nenhum método de pagamento</p>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione um cartão para facilitar seus pagamentos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {card.cardBrand} •••• {card.lastFour}
                        </p>
                        {card.isDefault && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Padrão
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {card.type === "credit" ? "Cartão de Crédito" : "Cartão de Débito"} • Expira em {card.expiryDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!card.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDefaultCard(card.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Tornar padrão
                      </Button>
                    )}
                    
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteCard(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Outras Configurações</CardTitle>
          <CardDescription>
            Configurações adicionais do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Funcionalidades adicionais estarão disponíveis em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
