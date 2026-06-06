function DisplayActivityList({ activities, loading, error }) {
    if (!activities || activities.length === 0) {
        return (
            <li className="border border-gray-200 rounded-xl p-4 text-gray-500 bg-blue-50 mt-4 dark:border-gray-800 dark:bg-blue-950/30 dark:text-gray-400">
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
                            className="border border-gray-200 rounded-xl p-4 space-y-2 bg-white dark:border-gray-800 dark:bg-gray-900"
                        >

                            {/* Top row */}
                            <div className="flex items-start justify-between">
                                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                    {activity.title}
                                </div>

                                <div className="text-2xl">
                                    {activity.icon}
                                </div>
                            </div>

                            {/* TASK */}
                            {isTask && (
                                <>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Type: Task
                                    </div>

                                    {payload.DueDate && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Due: {new Date(payload.DueDate).toLocaleDateString()}
                                        </div>
                                    )}

                                    {payload.Name && (
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            {payload.Name}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* NOTE */}
                            {isNote && (
                                <div className="text-sm text-gray-700">
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