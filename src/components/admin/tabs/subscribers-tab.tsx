"use client"

import { formatDate } from "@/lib/utils/date"

type Subscription = {
  id: string
  email: string
  created_at: string
  users: { name: string | null } | null
}

type Props = {
  subscriptions: Subscription[]
}

export function SubscribersTab({ subscriptions }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {subscriptions.length} abonnent{subscriptions.length !== 1 && "er"}
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">E-post</th>
              <th className="px-4 py-3 font-medium">Navn</th>
              <th className="px-4 py-3 font-medium">Abonnert siden</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Ingen abonnenter ennå
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{sub.email}</td>
                  <td className="px-4 py-3 font-medium">
                    {sub.users?.name ?? "Ukjent"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(sub.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
