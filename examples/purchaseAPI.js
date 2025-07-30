const { createPurchase, hasPurchased } = require('../lib/purchaseUtils');

/**
 * Example API endpoint for handling course purchases with duplicate protection
 * This would typically be used in your Next.js API routes
 */
async function handleCoursePurchase(req, res) {
  try {
    const { userId, courseId, amount, paymentMethod } = req.body;

    // Validate input
    if (!userId || !courseId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, courseId, amount'
      });
    }

    // Check if user already owns this course (optional pre-check)
    const alreadyOwns = await hasPurchased(userId, courseId);
    if (alreadyOwns) {
      return res.status(409).json({
        success: false,
        reason: 'already_owned',
        message: 'You already own this course',
        code: 'ALREADY_OWNED'
      });
    }

    // Attempt to create purchase with duplicate protection
    const result = await createPurchase(userId, courseId, null, {
      amount,
      paymentMethod: paymentMethod || 'unknown',
      purchaseSource: 'web',
      timestamp: new Date()
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Course purchased successfully',
        data: {
          courseId,
          amount,
          purchasedAt: new Date()
        }
      });
    } else {
      // Handle different failure reasons
      switch (result.reason) {
        case 'already_owned':
          return res.status(409).json({
            success: false,
            reason: 'already_owned',
            message: 'You already own this course',
            code: 'ALREADY_OWNED'
          });
        
        case 'recent_duplicate':
          return res.status(429).json({
            success: false,
            reason: 'recent_duplicate',
            message: 'Recent purchase attempt detected. Please wait a moment.',
            code: 'RATE_LIMITED'
          });
        
        default:
          return res.status(400).json({
            success: false,
            message: result.message || 'Purchase failed',
            code: 'PURCHASE_FAILED'
          });
      }
    }

  } catch (error) {
    console.error('Purchase API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Example API endpoint for handling test purchases
 */
async function handleTestPurchase(req, res) {
  try {
    const { userId, testId, amount, paymentMethod } = req.body;

    // Validate input
    if (!userId || !testId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, testId, amount'
      });
    }

    // Attempt to create purchase with duplicate protection
    const result = await createPurchase(userId, null, testId, {
      amount,
      paymentMethod: paymentMethod || 'unknown',
      purchaseSource: 'web',
      timestamp: new Date()
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Test purchased successfully',
        data: {
          testId,
          amount,
          purchasedAt: new Date()
        }
      });
    } else {
      // Handle different failure reasons
      switch (result.reason) {
        case 'already_owned':
          return res.status(409).json({
            success: false,
            reason: 'already_owned',
            message: 'You already own this test',
            code: 'ALREADY_OWNED'
          });
        
        case 'recent_duplicate':
          return res.status(429).json({
            success: false,
            reason: 'recent_duplicate',
            message: 'Recent purchase attempt detected. Please wait a moment.',
            code: 'RATE_LIMITED'
          });
        
        default:
          return res.status(400).json({
            success: false,
            message: result.message || 'Purchase failed',
            code: 'PURCHASE_FAILED'
          });
      }
    }

  } catch (error) {
    console.error('Test purchase API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Example frontend React component showing how to handle purchases
 */
const PurchaseButtonExample = `
import React, { useState } from 'react';

const PurchaseButton = ({ courseId, amount, userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/purchase/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          courseId,
          amount,
          paymentMethod: 'credit_card'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Purchase successful
        alert('Course purchased successfully!');
        // Update UI, redirect, etc.
      } else {
        // Handle different error cases
        switch (result.code) {
          case 'ALREADY_OWNED':
            setError('You already own this course');
            break;
          case 'RATE_LIMITED':
            setError('Please wait a moment before trying again');
            break;
          default:
            setError(result.message || 'Purchase failed');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handlePurchase}
        disabled={isLoading}
        className="purchase-button"
      >
        {isLoading ? 'Processing...' : 'Buy Course'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PurchaseButton;
`;

/**
 * Example Next.js API route implementation
 */
const NextJSAPIRouteExample = `
// pages/api/purchase/course.js
import { createPurchase, hasPurchased } from '../../../lib/purchaseUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, courseId, amount, paymentMethod } = req.body;

    // Validate input
    if (!userId || !courseId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create purchase with duplicate protection
    const result = await createPurchase(userId, courseId, null, {
      amount,
      paymentMethod: paymentMethod || 'unknown',
      purchaseSource: 'web'
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Course purchased successfully'
      });
    } else {
      return res.status(409).json({
        success: false,
        message: result.message,
        reason: result.reason
      });
    }

  } catch (error) {
    console.error('Purchase API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
`;

module.exports = {
  handleCoursePurchase,
  handleTestPurchase,
  PurchaseButtonExample,
  NextJSAPIRouteExample
}; 