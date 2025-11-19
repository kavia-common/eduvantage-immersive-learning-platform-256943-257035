import { renderHook, act } from '@testing-library/react-hooks';
import useBootcampResources from '../useBootcampResources';

jest.mock('../../supabaseClient', () => {
  const orig = jest.requireActual('../../supabaseClient');
  // Mock for getUser and .from for CRUD
  const fakeUserId = 'test-user-123';
  return {
    ...orig,
    supabase: {
      ...orig.supabase,
      auth: {
        getUser: jest.fn(async () => ({ data: { user: { id: fakeUserId } }, error: null })),
      },
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            data: [{ id: 1, title: 'Test', type: 'link', url: 'https://test.com', storage_path: null, original_name: null, mime_type: null, size_bytes: null, owner_id: fakeUserId, created_at: '2024-05-20T01:02:03Z' }],
            error: null,
          })),
        })),
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            eq: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            then: jest.fn(),
            data: [{ id: 2, title: 'File', type: 'file', storage_path: 'bootcamp/file1.pdf', original_name: 'file1.pdf', mime_type: 'application/pdf', size_bytes: 1000, url: null, owner_id: fakeUserId, created_at: '2024-05-20T01:02:03Z' }],
            error: null,
            count: 1,
          })),
        })),
      })),
    },
  };
});

describe('useBootcampResources', () => {
  it('should validate HTTPS URL for link resource', async () => {
    const { result } = renderHook(() => useBootcampResources());
    await act(async () => {
      await result.current.addLink({ url: 'http://nonsecure.com', title: 'Bad' });
    });
    expect(result.current.error).toMatch(/valid HTTPS URL/);
  });

  it('should create a link successfully', async () => {
    const { result } = renderHook(() => useBootcampResources());
    await act(async () => {
      const res = await result.current.addLink({ url: 'https://good.com', title: 'My Link' });
      expect(res).toHaveProperty('id');
      expect(res.type).toBe('link');
    });
  });

  it('should create a file resource successfully', async () => {
    const { result } = renderHook(() => useBootcampResources());
    await act(async () => {
      const res = await result.current.addFile({
        storagePath: 'bootcamp/file1.pdf',
        originalName: 'file1.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1234,
        title: 'My File',
      });
      expect(res).toHaveProperty('id');
      expect(res.type).toBe('file');
    });
  });

  it('should handle missing file input fields', async () => {
    const { result } = renderHook(() => useBootcampResources());
    await act(async () => {
      await result.current.addFile({});
    });
    expect(result.current.error).toMatch(/Missing required file fields/);
  });
});
