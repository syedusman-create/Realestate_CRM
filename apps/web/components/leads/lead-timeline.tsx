import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { LeadActivity } from '@/lib/crm/leads/types'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

export default function LeadTimeline({
    activities,
}: {
    activities: LeadActivity[]
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity timeline</CardTitle>
            </CardHeader>

            <CardContent>
                {!activities.length ? (
                    <p className="text-sm text-muted-foreground">
                        No activity recorded yet.
                    </p>
                ) : (
                    <div className="space-y-5">
                        {activities.map((activity) => (
                            <div
                                key={`${activity.activity_type}-${activity.activity_id}`}
                                className="relative border-l pl-5"
                            >
                                <div className="absolute -left-1.5 top-1 size-3 rounded-full border-2 border-background bg-primary" />

                                <div className="flex flex-col gap-1">
                                    <div className="font-medium">
                                        {activity.title}
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        {activity.occurred_at
                                            ? formatDate(activity.occurred_at)
                                            : 'Date unavailable'}
                                        {activity.actor_name
                                            ? ` · ${activity.actor_name}`
                                            : ''}
                                    </div>

                                    {activity.detail && (
                                        <div className="text-sm text-muted-foreground">
                                            {activity.detail}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}