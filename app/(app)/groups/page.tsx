import React from 'react';
import ComingSoon from '@/components/ComingSoon'; // Path check kar lena

export const metadata = {
  title: "Groups | Coming Soon",
};

export default function GroupsPage() {
  return (
    <ComingSoon 
        title="Groups are Brewing!" 
        description="Hum jaldi hi Groups feature launch kar rahe hain. Aap apni team aur friends ke saath private groups bana sakenge."
    />
  );
}