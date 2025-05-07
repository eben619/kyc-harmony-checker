
import React from 'react';
import { useNotifications, Notification } from '@/contexts/NotificationsContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ShieldCheck, 
  FileCheck, 
  Bell, 
  User,
  Check,
  Trash
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const handleClick = () => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getIcon = () => {
    switch (notification.category) {
      case 'self':
        return <ShieldCheck className="h-5 w-5 text-primary" />;
      case 'kyc':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'tax':
        return <FileCheck className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <Card 
      className={cn(
        "p-4 mb-3 cursor-pointer transition-colors hover:bg-muted/30",
        !notification.read && "border-l-4 border-l-primary"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 bg-muted/50 rounded-full">
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className={cn(
              "text-sm font-medium", 
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
        </div>
        
        <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              aria-label="Mark as read"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-destructive hover:text-destructive" 
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
            aria-label="Delete notification"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const NotificationsList = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Your Notifications</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={markAllAsRead}
          disabled={!notifications.some(n => !n.read)}
        >
          Mark all as read
        </Button>
      </div>

      <div className="space-y-1">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-3" />
            <h3 className="text-lg font-medium mb-1">No notifications yet</h3>
            <p className="text-muted-foreground">
              Notifications about your account activity will appear here.
            </p>
          </Card>
        ) : (
          notifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
