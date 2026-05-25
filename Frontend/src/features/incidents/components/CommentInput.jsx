import { useState } from "react";

import { addComment } from "../services/incident.api";

function CommentInput({
  incidentId,
  refreshComments,
}) {
  const [message, setMessage] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    await addComment(
      incidentId,
      message
    );

    setMessage("");

    refreshComments();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-xl font-semibold">
        Add Comment
      </h2>

      <textarea
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="Add operational notes..."
        className="mb-4 w-full rounded border p-3"
        rows={4}
      />

      <button
        type="submit"
        className="rounded bg-black px-4 py-2 text-white"
      >
        Add Comment
      </button>
    </form>
  );
}

export default CommentInput;