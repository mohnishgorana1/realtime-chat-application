import React from 'react';
import ComingSoon from '@/components/ComingSoon'; 

export const metadata = {
  title: "Settings | Coming Soon",
};

export default function SettingsPage() {
  return (
    <ComingSoon 
        title="Settings Under Construction" 
        description="Profile customization aur privacy settings par kaam chal raha hai. Jaldi hi update aayega!"
    />
  );
}