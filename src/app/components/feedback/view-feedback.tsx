"use client";

import { Rating } from "@/components/ui/rating";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";

export default function ViewFeedback({ feedbackData }: any) {

    const router = useRouter();
  if (!feedbackData) {
    return <p className="text-center text-muted-foreground">No feedback available.</p>;
  }

  const { rating, comments } = feedbackData;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Card className="p-6 space-y-6 shadow-md bg-white dark:bg-muted rounded-xl border">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Visitor Feedback</h2>
          <p className="text-muted-foreground text-sm">
            Here's how the visitor rated their experience.
          </p>
        </div>

        <Separator />

        {/* Rating */}
        <div className="text-center">
          <p className="text-lg font-medium">Rating</p>
          <div className="flex justify-center mt-2">
            <Rating value={rating}  />
          </div>
        </div>

        {/* Comments */}
        <div>
          <p className="text-lg font-medium mb-1">Comments</p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-100">
            {comments || (
              <span className="text-muted-foreground italic">
                No comments provided.
              </span>
            )}
          </div>
        </div>
                     <Button
              type="button"
              onClick={() => router.push("/feedback/listfeedback")}            
            >
              Back
            </Button>
      </Card>


    </div>
  );
}
