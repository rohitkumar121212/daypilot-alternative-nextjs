import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collaboratorId, collaboratorName } = body;

    console.log('API: Collaborator change request received:', { collaboratorId, collaboratorName });

    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success response
    return NextResponse.json({
      success: true,
      message: `Successfully changed collaborator to ${collaboratorName}`,
      collaboratorId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API: Error changing collaborator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change collaborator' },
      { status: 500 }
    );
  }
}