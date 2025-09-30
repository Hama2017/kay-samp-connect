import { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSpaceInvitations } from '@/hooks/useSpaceInvitations';
import { Card } from '@/components/ui/card';

interface UserProfile {
  id: string;
  username: string;
  profile_picture_url?: string;
}

interface UserSearchComboboxProps {
  selectedUsers: UserProfile[];
  onUsersChange: (users: UserProfile[]) => void;
  placeholder?: string;
}

export function UserSearchCombobox({ selectedUsers, onUsersChange, placeholder = "Saisir un nom d'utilisateur..." }: UserSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchUsers } = useSpaceInvitations();

  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchUsers(searchQuery);
        // Filter out already selected users
        const filteredResults = results.filter(
          result => !selectedUsers.some(selected => selected.id === result.id)
        );
        setUsers(filteredResults);
        setIsSearching(false);
      } else {
        setUsers([]);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers, selectedUsers]);

  const handleUserClick = (user: UserProfile) => {
    onUsersChange([...selectedUsers, user]);
    setSearchQuery('');
    setUsers([]);
  };

  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(user => user.id !== userId));
  };

  return (
    <div className="w-full space-y-3 relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      
      {searchQuery.trim().length >= 2 && (
        <Card className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-background">
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

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="gap-2">
              <Avatar className="h-4 w-4">
                <AvatarImage src={user.profile_picture_url} />
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span>@{user.username}</span>
              <button
                onClick={() => handleRemoveUser(user.id)}
                className="hover:bg-background/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}