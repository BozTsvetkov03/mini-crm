function DisplayActivityList({ activities, loading, error }) {
    if (!activities || activities.length === 0) {
        return (
            <li className="border border-line rounded-xl p-4 text-ink-muted bg-secondary/10 mt-4">
                Activities will appear here
            </li>
        );
    }

    return (
        <div>
            <ul className="space-y-3 mt-6">

                {activities.map((activity) => {

                    const payload = activity.data || {};

                    const isTask =
                        activity.type === "TaskCreated" ||
                        activity.type === "TaskEdited" ||
                        activity.type === "TaskCompleted";

                    const isNote =
                        activity.type === "NoteCreated" ||
                        activity.type === "NoteEdited";

                    return (
                        <li
                            key={`${activity.type}-${activity.createdAt}`}
                            className="border border-line rounded-xl p-4 space-y-2 bg-surface"
                        >

                            {/* Top row */}
                            <div className="flex items-start justify-between">
                                <div className="font-semibold text-lg text-ink">
                                    {activity.title}
                                </div>

                                <div className="text-2xl">
                                    {activity.icon}
                                </div>
                            </div>

                            {/* TASK */}
                            {isTask && (
                                <>
                                    <div className="text-sm text-ink-muted">
                                        Type: Task
                                    </div>

                                    {payload.DueDate && (
                                        <div className="text-sm text-ink-muted">
                                            Due: {new Date(payload.DueDate).toLocaleDateString()}
                                        </div>
                                    )}

                                    {payload.Name && (
                                        <div className="text-sm text-ink">
                                            {payload.Name}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* NOTE */}
                            {isNote && (
                                <div className="text-sm text-ink">
                                    {payload.Body}
                                </div>
                            )}

                        </li>
                    );
                })}

            </ul>
        </div>
    );
}

export default DisplayActivityList;