/**
 *
 * SocialShare
 *
 */

import React from 'react';
import { Facebook, Twitter, Mail, MessageCircle } from 'lucide-react/dist/cjs/lucide-react.cjs';

import {
  EmailShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookShareButton
} from 'react-share';

const SocialShare = props => {
  const { product } = props;

  const shareMsg = `I ♥ ${product.name
    } product on CARTZA!  Here's the link, ${window.location.protocol !== 'https' ? 'http' : 'https'
    }://${window.location.host}/product/${product.slug}`;

  return (
    <ul className='d-flex flex-row mx-0 mb-0 justify-content-center justify-content-md-start share-box'>
      <li>
        <FacebookShareButton url={`${shareMsg}`} className='share-btn facebook'>
          <Facebook size={16} strokeWidth={2} />
        </FacebookShareButton>
      </li>
      <li>
        <TwitterShareButton url={`${shareMsg}`} className='share-btn twitter'>
          <Twitter size={16} strokeWidth={2} />
        </TwitterShareButton>
      </li>
      <li>
        <EmailShareButton url={`${shareMsg}`} className='share-btn envelope'>
          <Mail size={16} strokeWidth={2} />
        </EmailShareButton>
      </li>
      <li>
        <WhatsappShareButton url={`${shareMsg}`} className='share-btn whatsapp'>
          <MessageCircle size={16} strokeWidth={2} />
        </WhatsappShareButton>
      </li>
    </ul>
  );
};

export default SocialShare;
