import { useState, useEffect } from "react";
import { Plus, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  currency: string;
}

const initialExpenses: Expense[] = [
  { id: '1', category: 'accommodation', description: 'Hotel Le Morne - 3 nights', amount: 450, date: '2024-03-15', currency: 'USD' },
  { id: '2', category: 'food', description: 'Dinner at Beach Restaurant', amount: 85, date: '2024-03-15', currency: 'USD' },
  { id: '3', category: 'transport', description: 'Airport Transfer', amount: 45, date: '2024-03-15', currency: 'USD' },
  { id: '4', category: 'activity', description: 'Underwater Sea Walk', amount: 120, date: '2024-03-16', currency: 'USD' },
];

export default function Budget() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [totalBudget, setTotalBudget] = useState<number>(2500);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: '',
    date: '',
    currency: 'USD'
  });
  const { toast } = useToast();

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryColors = {
    accommodation: 'bg-primary',
    food: 'bg-sunset',
    transport: 'bg-ocean-deep',
    activity: 'bg-palm',
    shopping: 'bg-accent',
    other: 'bg-muted'
  };

  const categoryIcons = {
    accommodation: '🏨',
    food: '🍽️',
    transport: '🚗',
    activity: '🏃‍♂️',
    shopping: '🛍️',
    other: '📍'
  };

  useEffect(() => {
    const tripData = localStorage.getItem('tripData');
    if (tripData) {
      const data = JSON.parse(tripData);
      if (data.budget) {
        setTotalBudget(parseInt(data.budget));
      }
    }
  }, []);

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount || !newExpense.date) {
      toast({
        title: "Please fill in all fields",
        description: "All expense details are required.",
        variant: "destructive"
      });
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      currency: newExpense.currency
    };

    setExpenses(prev => [...prev, expense]);
    setNewExpense({ category: '', description: '', amount: '', date: '', currency: 'USD' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Expense added! 💰",
      description: `Added ${expense.currency} ${expense.amount} for ${expense.description}`,
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    toast({
      title: "Expense deleted",
      description: "The expense has been removed from your budget.",
    });
  };

  const getBudgetStatus = () => {
    if (spentPercentage > 100) return { status: 'over', color: 'text-destructive', icon: TrendingDown };
    if (spentPercentage > 80) return { status: 'warning', color: 'text-sunset', icon: AlertTriangle };
    return { status: 'good', color: 'text-palm', icon: TrendingUp };
  };

  const budgetStatus = getBudgetStatus();
  const StatusIcon = budgetStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-light to-sand p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ocean-deep mb-2">Budget Tracker</h1>
            <p className="text-muted-foreground">Monitor your spending and stay within budget</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-tropical">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Track a new expense for your Mauritius trip
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accommodation">🏨 Accommodation</SelectItem>
                      <SelectItem value="food">🍽️ Food & Dining</SelectItem>
                      <SelectItem value="transport">🚗 Transport</SelectItem>
                      <SelectItem value="activity">🏃‍♂️ Activities</SelectItem>
                      <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                      <SelectItem value="other">📍 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="What did you spend on?"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={newExpense.currency} onValueChange={(value) => setNewExpense(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="MUR">MUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <Button onClick={handleAddExpense} className="w-full bg-gradient-tropical">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ocean-deep">
                ${totalBudget.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <StatusIcon className={`h-5 w-5 ${budgetStatus.color}`} />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ocean-deep mb-2">
                ${totalSpent.toLocaleString()}
              </div>
              <Progress value={spentPercentage} className="h-2" />
              <div className="text-sm text-muted-foreground mt-1">
                {spentPercentage.toFixed(1)}% of budget
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-palm' : 'text-destructive'}`}>
                ${Math.abs(remaining).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {remaining >= 0 ? 'Under budget' : 'Over budget'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>See where your money is going</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(categoryTotals).map(([category, amount]) => (
                <div key={category} className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${categoryColors[category as keyof typeof categoryColors]} text-white`}>
                    <span className="text-lg">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                  </div>
                  <div className="text-sm font-medium capitalize">{category}</div>
                  <div className="text-lg font-bold text-ocean-deep">${amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expense List */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-soft">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>All your tracked expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${categoryColors[expense.category as keyof typeof categoryColors]} text-white`}>
                        {categoryIcons[expense.category as keyof typeof categoryIcons]} {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      {expense.currency} {expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}