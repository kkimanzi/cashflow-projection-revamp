import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  DollarSign,
  Shield,
  Users,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-primary/10 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Never Face a{" "}
                  <span className="text-primary">Bounced Cheque</span> Again
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Project your account cash flow with precision. Know exactly
                  when money comes in and goes out, ensuring your accounts
                  always have the funds you need.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-primary hover:bg-primary/90" size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Cash Flow Management
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                Everything you need to stay on top of your account finances
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <DollarSign className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Real-Time Projections</CardTitle>
                  <CardDescription>
                    See your future account balance based on expected money in
                    and out transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Start from your latest reconciliation and project forward to
                    see exactly where your cash flow will be on any future date.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Recurring Transactions</CardTitle>
                  <CardDescription>
                    Set up recurring income and expenses to automate your
                    projections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Define weekly deposits, monthly payments, and other
                    recurring transactions to get accurate long-term
                    projections.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Multi-Account Management</CardTitle>
                  <CardDescription>
                    Track multiple bank accounts with shared access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monitor all your business and personal accounts in one
                    place, with the ability to share access with your accountant
                    or team.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                Simple steps to better cash flow management
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Set Account Balance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter your current account balance as your starting point
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Add Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Define your expected deposits and withdrawals
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Set Recurring</h3>
                <p className="text-sm text-muted-foreground">
                  Configure recurring transactions for automated projections
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold mb-2">Monitor & Plan</h3>
                <p className="text-sm text-muted-foreground">
                  View your projected balance and plan accordingly
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Prevent Financial Surprises
                </h2>
                <p className="text-muted-foreground md:text-lg">
                  Stop worrying about insufficient funds. Our ledger-style
                  interface shows you exactly when money flows in and out of
                  your accounts, with running balance calculations.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm">
                      Avoid bounced cheques and overdraft fees
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-sm">
                      Make informed financial decisions
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span className="text-sm">
                      Plan for seasonal cash flow variations
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Sample Account Ledger
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Date</th>
                          <th className="text-right py-2">Deposits</th>
                          <th className="text-right py-2">Withdrawals</th>
                          <th className="text-right py-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-1">
                        <tr className="border-b">
                          <td className="py-2">Dec 15 (Balance)</td>
                          <td className="text-right">-</td>
                          <td className="text-right">-</td>
                          <td className="text-right font-semibold">$25,000</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Dec 16</td>
                          <td className="text-right text-green-600">$8,500</td>
                          <td className="text-right">-</td>
                          <td className="text-right">$33,500</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Dec 18</td>
                          <td className="text-right">-</td>
                          <td className="text-right text-red-600">$12,000</td>
                          <td className="text-right">$21,500</td>
                        </tr>
                        <tr>
                          <td className="py-2">Dec 20</td>
                          <td className="text-right text-green-600">$15,200</td>
                          <td className="text-right">-</td>
                          <td className="text-right">$36,700</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Ready to Take Control?
                </h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground md:text-xl">
                  Join thousands who never worry about their account balances
                  again.
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  size="lg"
                  className="bg-background text-primary hover:bg-background/90"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
