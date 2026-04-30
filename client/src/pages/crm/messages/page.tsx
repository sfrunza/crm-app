import { Outlet, useParams } from "react-router";
import { ChatList } from "./_components/chat-list";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { MessagesSquareIcon } from "@/components/icons";

function MessagesPage() {
  const { requestId } = useParams();

  return (
    <div className="mx-auto h-full max-w-7xl overflow-hidden">
      <div className="grid h-full lg:grid-cols-[20rem_auto]">
        <ChatList />
        {/* Message Area */}
        {requestId && <Outlet />}
        {!requestId && (
          <Empty className="max-lg:hidden">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessagesSquareIcon />
              </EmptyMedia>
              <EmptyDescription>
                Select a request to view its messages.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}

export const Component = MessagesPage;
