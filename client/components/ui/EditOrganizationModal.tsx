'use client';

import React, { useState, useEffect } from 'react';
import { Building2, X, Save, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { FormInput } from './FormInput';

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  } | null;
  onSuccess?: () => void;
}

export const EditOrganizationModal: React.FC<EditOrganizationModalProps> = ({
  isOpen,
  onClose,
  organization,
  onSuccess,
}) => {
  const { updateOrganization } = useAuth();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setSlug(organization.slug || '');
      setLogo(organization.logo || '');
      setError('');
      setIsSaved(false);
    }
  }, [organization]);

  if (!isOpen || !organization) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await updateOrganization(organization.id, {
        name,
        slug,
        logo: logo || undefined,
      });
      setIsSaved(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[10px] border border-border bg-surface p-6 shadow-lg space-y-5 relative overflow-hidden">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-text-primary">Edit Organization</h3>
              <p className="text-xs text-text-secondary">
                Update organization details & routing slug
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-xs font-medium">
              {error}
            </div>
          )}

          <FormInput
            label="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FormInput
            label="Organization Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText="Unique URL slug (lowercase alphanumeric and hyphens)"
            required
          />

          <FormInput
            label="Logo URL (Optional)"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://..."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-border bg-surface-secondary hover:bg-surface text-xs font-medium text-text-primary transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-primary-foreground" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
