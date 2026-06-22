/**
 *
 * Inquiries Container
 *
 */

import React, { Component } from 'react';
import axios from 'axios';
import { Row, Col, Container } from 'reactstrap';
import { success, error } from 'react-notification-system-redux';

import SubPage from '../../components/Manager/SubPage';
import Input from '../../components/Common/Input';
import Badge from '../../components/Common/Badge';
import Button from '../../components/Common/Button';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import NotFound from '../../components/Common/NotFound';
import { API_URL } from '../../constants';
import { formatDate } from '../../utils/date';

class Inquiries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inquiries: [],
      isLoading: true,
      replies: {}, // Maps inquiry ID to reply input text
      formErrors: {} // Maps inquiry ID to validation errors
    };
  }

  componentDidMount() {
    this.fetchInquiries();
  }

  fetchInquiries = async () => {
    try {
      this.setState({ isLoading: true });
      const response = await axios.get(`${API_URL}/contact`);
      if (response.data.success) {
        this.setState({ inquiries: response.data.contacts });
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleReplyChange = (id, value) => {
    this.setState(prevState => ({
      replies: {
        ...prevState.replies,
        [id]: value
      },
      formErrors: {
        ...prevState.formErrors,
        [id]: null
      }
    }));
  };

  submitReply = async id => {
    const replyText = this.state.replies[id];
    if (!replyText || !replyText.trim()) {
      this.setState(prevState => ({
        formErrors: {
          ...prevState.formErrors,
          [id]: 'Reply cannot be empty.'
        }
      }));
      return;
    }

    try {
      this.setState({ isLoading: true });
      const response = await axios.put(`${API_URL}/contact/reply/${id}`, {
        reply: replyText.trim()
      });

      if (response.data.success) {
        // Update local state directly
        const updatedInquiries = this.state.inquiries.map(inq => {
          if (inq._id === id) {
            return response.data.contact;
          }
          return inq;
        });

        this.setState(prevState => {
          const newReplies = { ...prevState.replies };
          delete newReplies[id];
          return {
            inquiries: updatedInquiries,
            replies: newReplies
          };
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { inquiries, isLoading, replies, formErrors } = this.state;

    return (
      <div className='inquiries-dashboard'>
        <SubPage title='Support Inquiries'>
          {isLoading && <LoadingIndicator />}
          
          {!isLoading && inquiries.length === 0 && (
            <NotFound message='No support inquiries found.' />
          )}

          {!isLoading && inquiries.length > 0 && (
            <div className='inquiries-list mt-3'>
              {inquiries.map((inq, index) => {
                const isResolved = inq.status === 'Resolved';
                const replyText = replies[inq._id] || '';
                const errorText = formErrors[inq._id] || null;

                return (
                  <div key={inq._id || index} className='review-box mb-4 p-4 border rounded bg-white shadow-sm'>
                    <div className='d-flex align-items-center justify-content-between mb-3 border-bottom pb-2'>
                      <div>
                        <div className='d-flex align-items-center flex-wrap mb-1'>
                          <h4 className='mb-0 fw-semibold text-black' style={{ marginRight: '8px' }}>{inq.name}</h4>
                          {inq.userRole === 'ROLE ADMIN' ? (
                            <Badge variant='primary'>Admin</Badge>
                          ) : inq.userRole === 'ROLE MERCHANT' ? (
                            <Badge variant='dark'>Merchant</Badge>
                          ) : inq.userRole === 'ROLE MEMBER' ? (
                            <Badge variant='secondary'>Member</Badge>
                          ) : (
                            <Badge variant='none' className='border text-muted'>Guest</Badge>
                          )}
                        </div>
                        <span className='text-muted fs-12'>{inq.email}</span>
                      </div>
                      <div>
                        <span className={`badge px-3 py-2 ${isResolved ? 'badge-success text-white' : 'badge-warning text-dark'}`}>
                          {inq.status}
                        </span>
                      </div>
                    </div>

                    <div className='mb-3'>
                      <span className='d-block text-muted fs-12 mb-1'>Original Message</span>
                      <p className='text-black fs-14 bg-light p-3 rounded mb-0'>{inq.message}</p>
                    </div>

                    <div className='mb-2'>
                      <span className='d-block text-muted fs-12'>{`Submitted on ${formatDate(inq.created)}`}</span>
                    </div>

                    {isResolved ? (
                      <div className='mt-3 border-top pt-3'>
                        <span className='d-block text-success fw-semibold fs-13 mb-1'>✓ Solution Sent:</span>
                        <p className='text-black fs-14 bg-light p-3 rounded mb-0 border-left border-success'>{inq.reply}</p>
                      </div>
                    ) : (
                      <div className='mt-3 border-top pt-3'>
                        <span className='d-block text-muted fs-12 mb-2'>Compose Reply / Solution</span>
                        <Input
                          type='textarea'
                          name={`reply-${inq._id}`}
                          placeholder='Type your solution to the user query here...'
                          value={replyText}
                          error={errorText}
                          onInputChange={(name, value) => this.handleReplyChange(inq._id, value)}
                        />
                        <div className='d-flex justify-content-end mt-3'>
                          <Button
                            variant='primary'
                            text='Send Solution via Email'
                            onClick={() => this.submitReply(inq._id)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SubPage>
      </div>
    );
  }
}

export default Inquiries;
