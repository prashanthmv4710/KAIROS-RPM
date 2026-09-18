import * as React from 'react';

import { Image } from '../../components/Image';
import { Icon } from '../../components/Icons';
import { IconButton } from '../../components/IconButton';
import { Modal } from '../../components/Modal';
import { Caption } from '../../components/Text';
import './ArticleThumbnail.css';

export interface ArticleThumbnailProps {
  articleId: string;
  articleName: string;
  imageUrl?: string;
  imageAlt?: string;
}

const FRAME_STYLE: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 6,
  background: 'var(--ld-semantic-color-fill-accent-blue-subtle)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

/**
 * 36x36 article thumbnail for the Rejected Orders table. Rows with a real
 * fixture photo (`imageUrl`) render as a button that opens a Modal with an
 * expanded view of the same photo — rows without one keep the plain grey
 * placeholder icon (nothing to expand).
 *
 * Deliberately a Modal, not a Popover: this thumbnail lives inside
 * `.rpm-orders-table`, which sets `overflow-x: auto` (and therefore
 * `overflow-y: auto` too, per the CSS overflow spec). Popover's surface is
 * `position: absolute` relative to its trigger, so it gets clipped by that
 * scroll container the instant it extends past its bounds — visually
 * "invisible" even though it did render. Modal is a centered, viewport-fixed
 * overlay, so it always appears regardless of the table's scroll position.
 */
export function ArticleThumbnail({ articleId, articleName, imageUrl, imageAlt }: ArticleThumbnailProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!imageUrl) {
    return (
      <div style={FRAME_STYLE}>
        <Icon name="Image" decorative style={{ color: 'var(--ld-semantic-color-text-accent-blue)' }} />
      </div>
    );
  }

  const alt = imageAlt ?? articleName;

  return (
    <>
      <IconButton
        a11yLabel={`View larger image of ${articleName}`}
        variant="ghost"
        size="small"
        onClick={() => setIsOpen(true)}
        UNSAFE_style={{ ...FRAME_STYLE, padding: 0 }}
      >
        <Image src={imageUrl} alt={alt} UNSAFE_style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </IconButton>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={articleId} size="medium">
        <Caption color="subtle" UNSAFE_className="rpm-article-modal-subtitle">
          {articleName}
        </Caption>
        <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 8 }}>
          <Image src={imageUrl} alt={alt} UNSAFE_style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </Modal>
    </>
  );
}
