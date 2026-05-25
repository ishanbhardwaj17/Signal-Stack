function CommentsCard({
    comments,
}) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
                Comments
            </h2>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div
                        key={comment._id}
                        className="rounded border p-4"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <p className="font-medium">
                                {comment.userId.name}
                            </p>

                            <p className="text-sm text-gray-500">
                                {new Date(
                                    comment.createdAt
                                ).toLocaleString()}
                            </p>
                        </div>

                        <p>{comment.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CommentsCard;