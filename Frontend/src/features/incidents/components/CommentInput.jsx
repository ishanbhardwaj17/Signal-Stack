import { useState } from "react";

import { addComment } from "../services/incident.api";

function CommentInput({
  incidentId,
  onCommentAdded,
  disabled = false,
  helperText = "",
}) {
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || disabled)
      return;

    try {
      setError("");

      const comment = await addComment(
        incidentId,
        message
      );

      setMessage("");
      onCommentAdded?.(comment);
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to add comment"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-xl font-semibold">
        Add Comment
      </h2>

      {helperText ? (
        <p className="mb-3 text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p className="mb-3 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      <textarea
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        disabled={disabled}
        placeholder="Add operational notes..."
        className="mb-4 w-full rounded border p-3 disabled:bg-gray-100"
        rows={4}
      />

      <button
        type="submit"
        disabled={disabled}
        className="rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        Add Comment
      </button>
    </form>
  );
}

export default CommentInput;
