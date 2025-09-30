import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSpaceInvitations } from '@/hooks/useSpaceInvitations';
import { Card } from '@/components/ui/card';

interface UserProfile {
  id: string;
  username: string;
  profile_picture_url?: string;
}

interface UserSearchComboboxProps {
  onUserSelect: (user: UserProfile) => void;
  placeholder?: string;
}

export function UserSearchCombobox({ onUserSelect, placeholder = "Saisir un nom d'utilisateur..." }: UserSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchUsers } = useSpaceInvitations();

  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchUsers(searchQuery);
        setUsers(results);
        setIsSearching(false);
      } else {
        setUsers([]);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const handleUserClick = (user: UserProfile) => {
    onUserSelect(user);
    setSearchQuery('');
    setUsers([]);
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      
      {searchQuery.trim().length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Recherche en cours...
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <div className="p-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_picture_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">@{user.username}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}