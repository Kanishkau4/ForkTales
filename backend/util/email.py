import resend
from core.config import settings

if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY

def send_story_notification(email: str, story_title: str, story_id: int):
    """Sends an email notification when a story is successfully generated."""
    if not settings.RESEND_API_KEY or not email:
        print(f"Skipping email to {email}: RESEND_API_KEY not set")
        return

    try:
        # Construct the story URL (using localhost for dev, should be config-based for prod)
        # Assuming frontend runs on http://localhost:5173
        story_url = f"http://localhost:5173/story/{story_id}"
        
        params = {
            "from": "ForkTales <onboarding@resend.dev>",
            "to": [email],
            "subject": f"Your Adventure is Ready: {story_title}",
            "html": f"""
            <div style="font-family: 'Courier New', Courier, monospace; background-color: #05020a; color: #ffffff; padding: 40px; border: 2px solid #7c3aed; border-radius: 10px;">
                <h1 style="color: #a78bfa; text-transform: uppercase; letter-spacing: 2px;">Greetings, Adventurer!</h1>
                <p style="font-size: 16px; line-height: 1.6;">Your latest story, <strong>'{story_title}'</strong>, has been forged in the digital fires.</p>
                <div style="margin: 30px 0;">
                    <a href="{story_url}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase;">Enter the Story</a>
                </div>
                <p style="color: #666; font-size: 12px;">May your choices lead you to glory.</p>
                <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
                <p style="font-size: 10px; color: #444;">ForkTales AI Story Engine</p>
            </div>
            """
        }
        
        resend.Emails.send(params)
        print(f"Notification email sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
