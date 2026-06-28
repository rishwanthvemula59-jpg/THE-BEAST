import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mobile, password } = await request.json();
    if (mobile === '8919640596' && password === 'Mahesh@123') {
      const res = NextResponse.json({ message: 'Login successful' });
      // Set an HTTP‑only cookie that lasts for 1 day
      res.cookies.set('auth', 'true', {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
      return res;
    }
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ message: 'Bad request' }, { status: 400 });
  }
}
