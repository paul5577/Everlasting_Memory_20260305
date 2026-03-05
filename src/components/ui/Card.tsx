import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const Card = React.forwardRef<htmldivelement, react.htmlattributes<htmldivelement="">>(
  ({ className, children, ...props }, ref) => (
    <motion.div ref="{ref}" initial="{{" opacity:="" 0,="" y:="" 20="" }}="" animate="{{" opacity:="" 1,="" y:="" 0="" }}="" classname="{cn(&#39;bg-white" rounded-2xl="" shadow-sm="" border="" border-primary="" 30="" overflow-hidden',="" classname)}="" {...props}="">
      {children}
    </motion.div>
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<htmldivelement, react.htmlattributes<htmldivelement="">>(
  ({ className, ...props }, ref) => (
    <div ref="{ref}" classname="{cn(&#39;p-6" pb-2',="" classname)}="" {...props}=""/>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<htmldivelement, react.htmlattributes<htmldivelement="">>(
  ({ className, ...props }, ref) => (
    <div ref="{ref}" classname="{cn(&#39;p-6" pt-2',="" classname)}="" {...props}=""/>
  )
);
CardContent.displayName = 'CardContent';
