import { WalletDashboard } from "@/components/WalletDashboard";
import { AccountManagerLogin } from "@/components/AccountManagerLogin";
import { TabPanel } from "@/components/TabPanel";

export default function Home() {
  const tabs = [
    {
      id: "add-account-manager",
      label: "Add Account Manager",
      content: <WalletDashboard />
    },
    {
      id: "login-account-manager",
      label: "Login with Account Manager",
      content: <AccountManagerLogin />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Web3 Wallet Connector
        </h1>
        <TabPanel tabs={tabs} defaultTab="add-account-manager" />
      </div>
    </div>
  );
}
