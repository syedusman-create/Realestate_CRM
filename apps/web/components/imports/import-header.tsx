import Link from 'next/link'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ImportHeader() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Import Center
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Bring leads and property inventory into your CRM
            using CSV files.
          </p>
        </div>

        <Link href="/dashboard" className={buttonVariants()}>
          Back to dashboard
        </Link>
       
      </CardContent>
    </Card>
  )
}