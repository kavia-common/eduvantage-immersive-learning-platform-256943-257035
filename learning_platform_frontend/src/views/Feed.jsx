import React from "react";
import { FeedProvider } from "../state/feedSlice";
import Feed from "../components/feed/Feed";

/**
 * PUBLIC_INTERFACE
 * FeedView - protected social feed page using FeedProvider.
 */
export default function FeedView() {
  return (
    <div className="container">
      <FeedProvider>
        <Feed />
      </FeedProvider>
    </div>
  );
}
