// tests/api.spec.js
const { test, expect, request } = require('@playwright/test');
const { createRandomUser } = require('../helpers/userGenerator');
require('dotenv').config();


test.describe('GoRest API Tests', () => {

    test('Get Users', async ({ request }) => {
      const response = await request.get('users');
      expect(response.ok()).toBeTruthy();
  
      const users = await response.json();
      expect(Array.isArray(users)).toBe(true);
    });
  
    test('Create a New User', async ({ request }) => {
        const newUser = createRandomUser();
        const response = await request.post('users', { data: newUser });
        expect(response.ok()).toBeTruthy();
      
        const user = await response.json();
      
        expect(user).toMatchObject(newUser);
    })
  
    test('Update a User', async ({ request }) => {
      // Create a user first
      const newUser = createRandomUser();
  
      const createResponse = await request.post('users', {
        data: newUser,
      });
      expect(createResponse.ok()).toBeTruthy();
      const createdUser = await createResponse.json();
  
      // Update the user's name
      const updatedUserData = {
        name: 'Updated User Name',
      };
  
      const updateResponse = await request.put(`users/${createdUser.id}`, {
        data: updatedUserData,
      });
      expect(updateResponse.ok()).toBeTruthy();
  
      const updatedUser = await updateResponse.json();
      expect(updatedUser.name).toBe(updatedUserData.name);
    });
  
    test('Delete a User', async ({ request }) => {
      // Create a user to delete
      const newUser = createRandomUser();
  
      const createResponse = await request.post('users', {
        data: newUser,
      });
      expect(createResponse.ok()).toBeTruthy();
      const createdUser = await createResponse.json();
  
      // Delete the user
      const deleteResponse = await request.delete(`users/${createdUser.id}`);
      expect(deleteResponse.status()).toBe(204); // No Content
  
      // Verify the user is deleted
      const getResponse = await request.get(`users/${createdUser.id}`);
      expect(getResponse.status()).toBe(404); // Not Found
    });
  
});