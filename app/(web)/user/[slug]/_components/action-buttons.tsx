// app/(web)/user/[slug]/_components/action-buttons.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { 
  MessageCircle, Bookmark, MoreVertical, Ban, Flag, CheckCircle2, Loader2 
} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  slug: string;
  isAuth: boolean;
  isFavorited: boolean;
  isBlocked: boolean;
  isReported: boolean;
  onGuestClick: () => void;
}

export function ActionButtons({ slug, isAuth, isFavorited, isBlocked, isReported, onGuestClick }: ActionButtonsProps) {
  const router = useRouter();
  
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(isFavorited);
  const [blocked, setBlocked] = useState(isBlocked);
  const [reported, setReported] = useState(isReported);

  const sendAction = async (action: string, body?: any) => {
    if (!isAuth) {
      onGuestClick();
      return;
    }
    setLoadingAction(action);
    try {
      const res = await api.post(`/users/${slug}/${action}`, body);
      if (res.data.success) {
        if (action === 'favorite') setFavorited(res.data.isFavorited);
        if (action === 'block') {
          setBlocked(res.data.isBlocked);
          if (res.data.isBlocked && favorited) setFavorited(false);
        }
        if (action === 'report') setReported(true);
        if (res.data.message) toast.success(res.data.message);
      } else if (res.data.message) {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleChat = () => {
    if (!isAuth) return onGuestClick();
    // TODO: Переход в чат, когда сделаем
    toast.info('Чат скоро будет доступен!');
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Написать */}
      <Button 
        variant="default" 
        className="flex-1 max-w-[16rem]" 
        disabled={loadingAction === 'chat'}
        onClick={() => sendAction('chat')}
      >
        {loadingAction === 'chat' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
        Написать
      </Button>

      {/* Избранное */}
      <Button 
        variant="outline" 
        className="flex-1 max-w-[16rem]" 
        disabled={loadingAction === 'favorite' || blocked}
        onClick={() => sendAction('favorite')}
      >
        {loadingAction === 'favorite' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
          <Bookmark className={`w-4 h-4 mr-2 ${favorited ? 'fill-primary text-primary' : ''}`} />
        }
        {favorited ? 'В избранном' : 'В избранное'}
      </Button>

      {/* Меню (Блок/Жалоба) */}          
      <DropdownMenu>
        {/* Убрали asChild, стилизуем триггер напрямую */}
        <DropdownMenuTrigger 
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "disabled:opacity-50")}
          disabled={loadingAction !== null}
        >
          <MoreVertical className="w-4 h-4" />
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="min-w-[12rem]">
          <DropdownMenuItem 
            disabled={reported} 
            onClick={() => sendAction('report', { reason: 'spam', description: 'Спам' })}
          >
            {reported ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Flag className="w-4 h-4 mr-2" />}
            {reported ? 'Жалоба отправлена' : 'Пожаловаться'}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => sendAction('block')}
            className={blocked ? 'text-green-600' : 'text-destructive'}
          >
            <Ban className="w-4 h-4 mr-2" />
            {blocked ? 'Разблокировать' : 'Заблокировать'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}