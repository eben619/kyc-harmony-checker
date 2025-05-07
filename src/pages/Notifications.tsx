
import React from 'react';
import NotificationsList from '@/components/notifications/NotificationsList';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';

const Notifications = () => {
  const { fetchNotifications } = useNotifications();

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      
      <NotificationsList />
    </div>
  );
};

export default Notifications;
