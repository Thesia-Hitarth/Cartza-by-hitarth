/**
 *
 * Complaints Container
 *
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col } from 'reactstrap';

import SubPage from '../../components/Manager/SubPage';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import NotFound from '../../components/Common/NotFound';
import { API_URL } from '../../constants';
import { formatDate } from '../../utils/date';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/contact/me`);
      if (response.data.success) {
        setComplaints(response.data.contacts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='complaints-dashboard'>
      <SubPage title='My Complaints'>
        {isLoading && <LoadingIndicator />}
        
        {!isLoading && complaints.length === 0 && (
          <NotFound message='You have no complaints registered yet.' />
        )}

        {!isLoading && complaints.length > 0 && (
          <div className='complaints-list mt-3'>
            {complaints.map((comp, index) => {
              const isResolved = comp.status === 'Resolved';

              return (
                <div key={comp._id || index} className='review-box mb-4 p-4 border rounded bg-white shadow-sm'>
                  <div className='d-flex align-items-center justify-content-between mb-3 border-bottom pb-2'>
                    <div>
                      <h4 className='mb-0 fw-semibold text-black'>{comp.name}</h4>
                      <span className='text-muted fs-12'>{comp.email}</span>
                    </div>
                    <div>
                      <span className={`badge px-3 py-2 ${isResolved ? 'badge-success text-white' : 'badge-warning text-dark'}`}>
                        {comp.status}
                      </span>
                    </div>
                  </div>

                  <div className='mb-3'>
                    <span className='d-block text-muted fs-12 mb-1'>Message</span>
                    <p className='text-black fs-14 bg-light p-3 rounded mb-0'>{comp.message}</p>
                  </div>

                  <div className='mb-2'>
                    <span className='d-block text-muted fs-12'>{`Submitted on ${formatDate(comp.created)}`}</span>
                  </div>

                  {isResolved && comp.reply && (
                    <div className='mt-3 border-top pt-3'>
                      <span className='d-block text-success fw-semibold fs-13 mb-1'>✓ Admin Reply:</span>
                      <p className='text-black fs-14 bg-light p-3 rounded mb-0 border-left border-success'>{comp.reply}</p>
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
};

export default Complaints;
