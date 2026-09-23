import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type TeamMetricsProps = {
  total: number
  active: number
  inactive: number
  roleCounts: Record<string, number>
}

export function TeamMetrics({
  total,
  active,
  inactive,
  roleCounts,
}: TeamMetricsProps) {
  const roles = Object.entries(
    roleCounts,
  ).sort(([, a], [, b]) => b - a)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total members
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-semibold">
            {total}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-semibold">
            {active}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Inactive
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-semibold">
            {inactive}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Roles
          </CardTitle>
        </CardHeader>

        <CardContent>
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No roles assigned.
            </p>
          ) : (
            <div className="space-y-1">
              {roles.map(
                ([role, count]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize">
                      {role.replaceAll(
                        '_',
                        ' ',
                      )}
                    </span>

                    <span className="font-medium">
                      {count}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}