## Data Models

### User
- name, email?, phoneNumber?, password?
- verification (email/phone), reset tokens
- isAdmin
- purchasedCourses [ObjectId], purchasedTests [ObjectId]

### Course
- title, description, price, thumbnailUrl
- lessons: [{ title, content, video? }]

### Test
- title/description (mn/en), testType, embedCode, price, thumbnailUrl, isActive
- optional `questions` for native test flows
- `uniqueCodes` for voucher flows

### Purchase
- user, course?, test?
- purchasedAt

### Payment
- payment_id, status, amount, currency, wallet, fee, name/description
- object_type, object_id (invoice id), relations to user/course/test
- indexes on `object_id`, `payment_id`

See `app/models/*.ts` for full schemas.


