import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert the file to an ArrayBuffer
    const bytes = await image.arrayBuffer();
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(bytes);
    // Convert to base64
    const base64Image = buffer.toString('base64');
    
    // Create a data URL that can be used in an <img> tag
    const dataUrl = `data:${image.type};base64,${base64Image}`;
    
    return NextResponse.json({
      success: true,
      imageUrl: dataUrl
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}